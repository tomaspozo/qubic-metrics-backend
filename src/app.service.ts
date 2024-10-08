import { Injectable } from '@nestjs/common';

const endpoints = [
  {
    name: 'Qubic',
    description: 'This endpoint provides metrics for the Qubic project',
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
      'This endpoint provides metrics for the Qubic open source repositories',
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
    `;
  }
}
