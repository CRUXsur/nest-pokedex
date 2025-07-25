import axios, { AxiosInstance } from "axios";
import { HttpAdapter } from "../interfaces/http-adapter.interface";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class AxiosAdapter implements HttpAdapter {


    private axios: AxiosInstance = axios;


    async get<T>(url: string): Promise<T> {
        try {
            const {data} = await this.axios.get<T>(url);
            return data;
        } catch (error) {
            throw new InternalServerErrorException(`This is an error - Check logs: ${JSON.stringify(error)}`);
        }
    }
}