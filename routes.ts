import  { DataBase } from "./db"


import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const authRoutes: FastifyPluginAsync = async (server) => {
  const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  server.post('/account', async (request, reply) => {
    const { username, password, email, name, id } = userSchema.parse(request.body);

    DataBase.creat({ username, password, email, name, id });

    return reply.status(201).send({ message: 'User created' });
  });

  server.post('/auth/login', async (request, reply) => {
    const { username, password } = loginSchema.parse(request.body);
    
    const user = server.users.find(u => u.username === username && u.password === password);
    if (user) {
      const token = server.jwt.sign({ username });
      return { token };
    }
    return reply.status(401).send({ message: 'Unauthorized' });
  });
};

export default authRoutes;












import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const userRoutes: FastifyPluginAsync = async (server) => {
  const userSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  server.post('/users', async (request, reply) => {
    const { username, password } = userSchema.parse(request.body);
    server.users.push({ username, password });
    return reply.status(201).send({ message: 'User created' });
  });

  server.delete('/users/:username', async (request, reply) => {
    const { username } = request.params;
    const index = server.users.findIndex(u => u.username === username);
    if (index !== -1) {
      server.users.splice(index, 1);
      return reply.send({ message: 'User deleted' });
    }
    return reply.status(404).send({ message: 'User not found' });
  });

  server.put('/users/:username', async (request, reply) => {
    const { username } = request.params;
    const { newPassword } = z.object({ newPassword: z.string().min(1) }).parse(request.body);
    const user = server.users.find(u => u.username === username);
    if (user) {
      user.password = newPassword;
      return reply.send({ message: 'User updated' });
    }
    return reply.status(404).send({ message: 'User not found' });
  });
};

export default userRoutes;

















/// rotas post

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const postRoutes: FastifyPluginAsync = async (server) => {
  server.decorate('posts', []); // Simulação de banco de dados em memória

  const postSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  });

  const authenticate = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  };

  server.post('/posts', { preHandler: authenticate }, async (request, reply) => {
    const { title, content } = postSchema.parse(request.body);
    const post = { id: server.posts.length + 1, title, content, username: request.user.username };
    server.posts.push(post);
    return reply.status(201).send(post);
  });

  server.delete('/posts/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params;
    const index = server.posts.findIndex(p => p.id === parseInt(id));
    if (index !== -1 && server.posts[index].username === request.user.username) {
      server.posts.splice(index, 1);
      return reply.send({ message: 'Post deleted' });
    }
    return reply.status(404).send({ message: 'Post not found or not authorized' });
  });

  server.put('/posts/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params;
    const { title, content } = postSchema.parse(request.body);
    const post = server.posts.find(p => p.id === parseInt(id));
    if (post && post.username === request.user.username) {
      post.title = title;
      post.content = content;
      return reply.send(post);
    }
    return reply.status(404).send({ message: 'Post not found or not authorized' });
  });

  server.get('/posts', async (request, reply) => {
    return server.posts;
  });
};

export default postRoutes;