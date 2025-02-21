
import pool from '../config/database';

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // Crear tabla de Usuarios
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Usuarios (
        ID INT PRIMARY KEY AUTO_INCREMENT,
        Email VARCHAR(100) UNIQUE NOT NULL,
        Password VARCHAR(255) NOT NULL,
        Rol ENUM('Administrador', 'Supervisor', 'Promotor') NOT NULL
      )
    `);

    // Crear tabla de Secciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Secciones (
        ID INT PRIMARY KEY AUTO_INCREMENT,
        NumeroSeccion INT UNIQUE NOT NULL
      )
    `);

    // Crear tabla de Partidos_Politicos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Partidos_Politicos (
        ID INT PRIMARY KEY AUTO_INCREMENT,
        Nombre VARCHAR(100) UNIQUE NOT NULL
      )
    `);

    // Crear tabla de Afiliados
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Afiliados (
        ID INT PRIMARY KEY AUTO_INCREMENT,
        Fotografia VARCHAR(255),
        ApellidoPaterno VARCHAR(100) NOT NULL,
        ApellidoMaterno VARCHAR(100) NOT NULL,
        Nombre VARCHAR(100) NOT NULL,
        Direccion TEXT NOT NULL,
        Telefono VARCHAR(20),
        ClaveElector VARCHAR(50) UNIQUE NOT NULL,
        CURP VARCHAR(18) UNIQUE NOT NULL,
        FechaNacimiento DATE NOT NULL,
        SeccionID INT NOT NULL,
        UbicacionGPS VARCHAR(100),
        PartidoPoliticoID INT,
        Categoria ENUM('Militante', 'Simpatizante', 'Indeciso', 'Adversario') NOT NULL,
        FOREIGN KEY (SeccionID) REFERENCES Secciones(ID),
        FOREIGN KEY (PartidoPoliticoID) REFERENCES Partidos_Politicos(ID)
      )
    `);

    // Crear tabla de Asignaciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Asignaciones (
        ID INT PRIMARY KEY AUTO_INCREMENT,
        SupervisorID INT NOT NULL,
        PromotorID INT NOT NULL,
        SeccionID INT NOT NULL,
        FOREIGN KEY (SupervisorID) REFERENCES Usuarios(ID),
        FOREIGN KEY (PromotorID) REFERENCES Usuarios(ID),
        FOREIGN KEY (SeccionID) REFERENCES Secciones(ID)
      )
    `);

    // Insertar datos iniciales de Secciones
    await connection.query(`
      INSERT IGNORE INTO Secciones (NumeroSeccion) VALUES 
      (4251), (4252), (4253)
    `);

    // Insertar usuario administrador inicial
    await connection.query(`
      INSERT IGNORE INTO Usuarios (Email, Password, Rol) VALUES 
      ('admin@sigid.com', 'temporal123', 'Administrador'),
      ('supervisor@sigid.com', 'temporal123', 'Supervisor'),
      ('promotor@sigid.com', 'temporal123', 'Promotor')
    `);

    console.log('Base de datos inicializada correctamente');
    connection.release();

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

initializeDatabase();
