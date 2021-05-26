const request = require('supertest');
const app = require('../app');
const { validate: isUuid } = require('uuid');

describe('Repositories', () => {
  it('should be able to create a new repository', async () => {
    const response = await request(app)
      .post('/repositories')
      .send({
        url: 'https://github.com/areasflavio/node-crud-TDD',
        title: 'node-crud-TDD',
        techs: ['Node', 'Express', 'Javascript'],
      });

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      url: 'https://github.com/areasflavio/node-crud-TDD',
      title: 'node-crud-TDD',
      techs: ['Node', 'Express', 'Javascript'],
      likes: 0,
    });
  });

  it('should be able to list the repositories', async () => {
    const repository = await request(app)
      .post('/repositories')
      .send({
        url: 'https://github.com/areasflavio/node-crud-TDD',
        title: 'node-crud-TDD',
        techs: ['Node', 'Express', 'Javascript'],
      });

    const response = await request(app).get('/repositories');

    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          id: repository.body.id,
          url: 'https://github.com/areasflavio/node-crud-TDD',
          title: 'node-crud-TDD',
          techs: ['Node', 'Express', 'Javascript'],
          likes: 0,
        },
      ])
    );
  });

  it('should be able to update repository', async () => {
    const repository = await request(app)
      .post('/repositories')
      .send({
        url: 'https://github.com/areasflavio/node-crud-TDD',
        title: 'node-crud-TDD',
        techs: ['Node', 'Express', 'Javascript'],
      });

    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send({
        url: 'https://github.com/areasflavio/task-app-server',
        title: 'task-app-server',
        techs: ['nodejs', 'express', 'mongodb'],
      });

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      url: 'https://github.com/areasflavio/task-app-server',
      title: 'task-app-server',
      techs: ['nodejs', 'express', 'mongodb'],
    });
  });

  it('should not be able to update a repository that does not exist', async () => {
    await request(app).put(`/repositories/123`).expect(400);
  });

  it('should not be able to update repository likes manually', async () => {
    const repository = await request(app)
      .post('/repositories')
      .send({
        url: 'https://github.com/areasflavio/node-crud-TDD',
        title: 'node-crud-TDD',
        techs: ['nodejs', 'express', 'mongodb'],
      });

    await request(app).post(`/repositories/${repository.body.id}/like`);

    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send({
        likes: 15,
      });

    expect(response.body).toMatchObject({
      likes: 1,
    });
  });

  it('should be able to delete the repository', async () => {
    const response = await request(app)
      .post('/repositories')
      .send({
        url: 'https://github.com/areasflavio/node-crud-TDD',
        title: 'node-crud-TDD',
        techs: ['Node', 'Express', 'Javascript'],
      });

    await request(app).delete(`/repositories/${response.body.id}`).expect(204);

    const repositories = await request(app).get('/repositories');

    const repository = repositories.body.find((r) => r.id === response.body.id);

    expect(repository).toBe(undefined);
  });

  it('should not be able to delete a repository that does not exist', async () => {
    await request(app).delete(`/repositories/123`).expect(400);
  });
});
