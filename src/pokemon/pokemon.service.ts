import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';//implementacion propia que hizo nest para inyectar nuestros modelos de mongoose
import { isValidObjectId, Model } from 'mongoose';

import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      //console.log(error);
      //this.handleExceptions(error);
      this.handleExceptions(error);
    }

  }

  findAll(paginationDto:PaginationDto) {

    const {limit = 10, offset = 0} = paginationDto;

    return this.pokemonModel.find()
      .limit ( limit )
      .skip ( offset )//find() es un metodo de mongoose que nos permite buscar todos los documentos de la coleccion
      .sort({no: 1})//sort() es un metodo de mongoose que nos permite ordenar los documentos de la coleccion
      .select('-__v');//select() es un metodo de mongoose que nos permite seleccionar los campos que queremos mostrar
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    //aqui nosotros tenemos que hacer la verificacion por:
    //MongoID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }
    
    //Name .... intentamos buscarlo por nombre
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
    }

    // en el caso de que no sea ninguno de los dos, no encontramos nada, entonces lanzamos un error
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with (id)term, name or no ${term} not found`);
    }
    
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }  
  }

  async remove(id: string) {//poner solo _id es el id de mongo
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return {id};
    // const result = await this.pokemonModel.findByIdAndDelete({ id });
    const {deletedCount} = await this.pokemonModel.deleteOne({ _id: id });//solo _id es el id de mongo
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }
    return;
  }


  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`); 
  }


}
