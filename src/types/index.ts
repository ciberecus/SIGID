
export interface Usuario {
  ID: number;
  Email: string;
  Password: string;
  Rol: 'Administrador' | 'Supervisor' | 'Promotor';
}

export interface Afiliado {
  ID: number;
  Fotografia?: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
  Nombre: string;
  Direccion: string;
  Telefono?: string;
  ClaveElector: string;
  CURP: string;
  FechaNacimiento: Date;
  SeccionID: number;
  UbicacionGPS?: string;
  PartidoPoliticoID?: number;
  Categoria: 'Militante' | 'Simpatizante' | 'Indeciso' | 'Adversario';
}

export interface Seccion {
  ID: number;
  NumeroSeccion: number;
}

export interface PartidoPolitico {
  ID: number;
  Nombre: string;
}

export interface Asignacion {
  ID: number;
  SupervisorID: number;
  PromotorID: number;
  SeccionID: number;
}
