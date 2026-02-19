const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');

class ContainerManager {
  constructor() {
    this.docker = new Docker({
      socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
    });
    this.containers = new Map(); // Map of userId -> container info
  }

  /**
   * Create or reuse a container for a user
   */
  async getOrCreateContainer(userId) {
    try {
      // Check if user already has active container
      if (this.containers.has(userId)) {
        const containerInfo = this.containers.get(userId);
        try {
          await this.docker.getContainer(containerInfo.id).inspect();
          return containerInfo; // Container still running
        } catch (error) {
          // Container no longer exists
          this.containers.delete(userId);
        }
      }

      // Create new container
      const containerName = `codeon-${userId}-${uuidv4().slice(0, 8)}`;
      
      const container = await this.docker.createContainer({
        Image: 'codeon/runtime:latest',
        Cmd: ['/bin/bash'],
        Tty: true,
        OpenStdin: true,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB limit
          MemorySwap: 512 * 1024 * 1024,
          CpuShares: 512, // Resources limit
          ReadonlyRootfs: false,
          NetworkMode: 'bridge',
        },
        WorkingDir: '/workspace',
        Env: [
          'NODE_ENV=production',
          `USER_ID=${userId}`,
        ]
      });

      await container.start();

      const containerInfo = {
        id: container.id,
        name: containerName,
        userId: userId,
        createdAt: new Date(),
        socket: null,
      };

      this.containers.set(userId, containerInfo);
      return containerInfo;
    } catch (error) {
      console.error('Error creating container:', error.message);
      throw error;
    }
  }

  /**
   * Execute code in container
   */
  async executeCode(userId, code, language = 'javascript') {
    try {
      const containerInfo = await this.getOrCreateContainer(userId);
      const container = this.docker.getContainer(containerInfo.id);

      // Create filename based on language
      const fileExtensions = {
        javascript: 'js',
        python: 'py',
        cpp: 'cpp',
        c: 'c',
        java: 'java',
        golang: 'go',
        rust: 'rs',
        ruby: 'rb',
        php: 'php',
        bash: 'sh',
      };

      const ext = fileExtensions[language] || 'txt';
      const filename = `code.${ext}`;

      // Write code to file
      const writeCmd = `cat > /tmp/${filename} << 'CODEON_EOF'\n${code}\nCODEON_EOF`;
      
      // Execute based on language
      const execCommands = {
        javascript: `node /tmp/${filename}`,
        python: `python3 /tmp/${filename}`,
        cpp: `g++ -o /tmp/code /tmp/${filename} && /tmp/code`,
        c: `gcc -o /tmp/code /tmp/${filename} && /tmp/code`,
        java: `javac /tmp/${filename} && java -cp /tmp Code`,
        bash: `bash /tmp/${filename}`,
      };

      const runCmd = execCommands[language] || `cat /tmp/${filename}`;
      const fullCmd = `${writeCmd} && ${runCmd}`;

      // Execute in container with timeout
      const exec = await container.exec({
        Cmd: ['/bin/bash', '-c', fullCmd],
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({ Detach: false });
      
      return new Promise((resolve, reject) => {
        let output = '';
        let error = '';

        stream.on('data', (chunk) => {
          output += chunk.toString();
        });

        stream.on('error', (err) => {
          error += err.toString();
        });

        stream.on('end', () => {
          resolve({
            output,
            error,
            exitCode: 0,
          });
        });

        setTimeout(() => {
          reject(new Error('Execution timeout (30 seconds)'));
        }, 30000);
      });
    } catch (error) {
      console.error('Execution error:', error.message);
      throw error;
    }
  }

  /**
   * Stop user's container
   */
  async stopContainer(userId) {
    try {
      if (!this.containers.has(userId)) {
        return;
      }

      const containerInfo = this.containers.get(userId);
      const container = this.docker.getContainer(containerInfo.id);
      
      await container.stop({ t: 5 });
      await container.remove();
      
      this.containers.delete(userId);
    } catch (error) {
      console.error('Error stopping container:', error.message);
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(userId) {
    try {
      if (!this.containers.has(userId)) {
        throw new Error('Container not found');
      }

      const containerInfo = this.containers.get(userId);
      const container = this.docker.getContainer(containerInfo.id);
      
      const logs = await container.logs({
        stdout: true,
        stderr: true,
      });

      return logs.toString();
    } catch (error) {
      console.error('Error getting logs:', error.message);
      throw error;
    }
  }

  /**
   * List all running containers
   */
  async listContainers() {
    return Array.from(this.containers.values());
  }

  /**
   * Cleanup: stop all containers on shutdown
   */
  async cleanup() {
    console.log('Cleaning up containers...');
    for (const [userId, _] of this.containers) {
      await this.stopContainer(userId);
    }
  }
}

module.exports = new ContainerManager();
