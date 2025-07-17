const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateEmail, validatePassword } = require('../utils/validation');
const { sendWelcomeEmail } = require('../services/emailService');

// Generar JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Registro de usuario
const register = async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password y name son requeridos'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const userData = {
      email,
      password: hashedPassword,
      name,
      role: ['user', 'venue', 'admin'].includes(role) ? role : 'user'
    };

    const user = await User.create(userData);

    // Generar token
    const token = generateToken(user.id);

    // Enviar email de bienvenida (asíncrono)
    sendWelcomeEmail(user.email, user.name).catch(error => {
      console.error('Error enviando email de bienvenida:', error);
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son requeridos'
      });
    }

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    // Actualizar último login (asíncrono)
    user.update({ last_login: new Date() }).catch(error => {
      console.error('Error actualizando último login:', error);
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });