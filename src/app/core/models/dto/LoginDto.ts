export interface LoginDto {
    idUser: number;
    name: string | null;
    password: string;
    rol: number | null;
    username: string;
    token: string;
}
