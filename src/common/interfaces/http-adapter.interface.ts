

export interface HttpAdapter {
    get<T>(url: string): Promise<T>; //get<T> es un generico que se usa para que el metodo get retorne un tipo T
}