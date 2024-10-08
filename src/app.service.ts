import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';

const endpoints = [
  {
    name: 'Qubic',
    description: 'This endpoints provides metrics for the Qubic project',
    endpoints: [
      {
        name: 'Stats',
        description: 'Get the stats of the Qubic project',
        path: 'stats/qubic/history',
        method: 'GET',
      },
    ],
  },
  {
    name: 'Open Source Stats',
    description:
      'This endpoints provides metrics for the Qubic open source repositories',
    endpoints: [
      {
        name: 'Overview',
        description:
          'Get aggregated metrics for all the repositories in the Qubic organization',
        path: 'stats/github/overview',
        method: 'GET',
      },
      {
        name: 'History',
        description:
          'Get a day to day history of the Qubic organization repositories metrics',
        path: 'stats/github/history',
        method: 'GET',
      },
      {
        name: 'Repositories',
        description:
          'List all the repositories in the Qubic organization with metrics',
        path: 'stats/github/repositories',
        method: 'GET',
      },
    ],
  },
];

@Injectable()
export class AppService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}
  getHello(): string {
    return `
    <h1>Hello World!</h1>
    <p>Welcome to the Qubic Metrics API</p>
    <p>This API is used to get metrics from Qubic ecosystem</p>
    <p>There are several endpoints available to get metrics:</p>
    ${endpoints
      .map(
        (group) => `
      <h2>${group.name}</h2>
      <p>${group.description}</p>
      <ul>
        ${group.endpoints
          .map(
            (endpoint) => `
          <li>
            Path: <code>GET /${endpoint.path}</code>
            <br>
            ${endpoint.description}
            <br>
            <a href="/${endpoint.path}">Open</a>
            </li>
        `,
          )
          .join('')}
      </ul>
    `,
      )
      .join('')}
    <h2>Authentication</h2>
    <p>This API is protected by API keys. You can request an API key by filling the form below.</p>
    <p>Once you have your API key, you can use it by adding it to the header of your request like this: <code>Authorization: Bearer YOUR_API_KEY</code></p>
    <p>Note that API keys are limited to 10 requests per day.</p>
    <form action="/api-key" method="post">
      <input type="email" name="email" placeholder="Your email" required>
      <button type="submit">Request API Key</button>
    </form>
      `;
  }

  async getApiKey(body: {
    email: string;
  }): Promise<{ token: string; createdAt: string }> {
    const currentToken = await this.prismaService.apiKey.findUnique({
      where: { email: body.email },
    });

    if (currentToken) {
      return {
        token: currentToken.key,
        createdAt: currentToken.createdAt.toISOString(),
      };
    }

    const payload = { email: body.email };
    const token = this.jwtService.sign(payload);

    await this.prismaService.apiKey.create({
      data: { email: body.email, key: token },
    });

    return { token, createdAt: new Date().toISOString() };
  }
}
