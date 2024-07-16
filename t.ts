import 'dotenv/config';
import fastify from 'fastify';
import cors from 'fastify-cors';
import jwt from 'fastify-jwt';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import postRoutes from './routes/post';

const server = fastify({ logger: true });

// Configurações CORS
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: any, allow?: boolean) => void) => {
    if (!origin || origin === 'http://localhost:3000') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Registrando o middleware CORS
server.register(cors, corsOptions);

// Configurando o JWT
server.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret',
});

// Registrando rotas
server.register(authRoutes);
server.register(userRoutes);
server.register(postRoutes);

// Configurando o proxy
server.register((instance, options, done) => {
  const apiUrl = process.env.API_URL;

  instance.use('/proxy', createProxyMiddleware({
    target: apiUrl,
    changeOrigin: true,
    pathRewrite: { '^/proxy': '' },
    onError: (err, req, res) => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway');
    },
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader('X-Special-Header', 'foobar');
    },
    onProxyRes: (proxyRes) => {
      proxyRes.headers['X-Added-Header'] = 'my-value';
    },
  }));

  done();
});

// Iniciando o servidor
const start = async () => {
  try {
    await server.listen(3000);
    server.log.info(`Server listening on http://localhost:3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();


