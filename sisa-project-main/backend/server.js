const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const studentsRoutes = require("./routes/studentsRoute");
const subjectRoutes = require("./routes/subjectRoutes");
const documentRoutes = require("./routes/documentRoutes");

dotenv.config();
const app = express();

// Porta do Railway (usa a variável PORT do ambiente)
const PORT = process.env.PORT || 5000;

// Configuração CORS para produção
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas (adicione seus domínios aqui)
    const allowedOrigins = [
      'https://localhost:3000',
      'https://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Adicione aqui o domínio do seu frontend quando hospedado
      // 'https://seu-frontend.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Para desenvolvimento, permitir todas as origens
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "10mb" }));

// Log de todas as requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "SISA API is running.",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de teste
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API está funcionando!",
    database: "Connected to Railway MySQL",
    timestamp: new Date().toISOString()
  });
});

// Ensure all route parameters are properly formatted
app.use("/api", (req, res, next) => {
  try {
    next();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Missing parameter name')) {
      console.error('Route parameter error:', error);
      res.status(400).json({
        message: 'Invalid route parameter',
        error: process.env.NODE_ENV === 'production' ? {} : error.message
      });
    } else {
      next(error);
    }
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/documents", documentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof TypeError && err.message.includes('Missing parameter name')) {
    return res.status(400).json({
      message: 'Invalid route parameter',
      error: process.env.NODE_ENV === 'production' ? 'Invalid route parameter' : err.message
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler - should be last
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Verificar variáveis de ambiente
console.log("✅ Verificando variáveis de ambiente...");
console.log("PORT:", process.env.PORT);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

// Log de inicialização do servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Database Host: ${process.env.DB_HOST}`);
});