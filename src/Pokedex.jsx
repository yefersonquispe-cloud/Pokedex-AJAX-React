import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Pokedex.css';

function Pokedex() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const obtenerPokemons = async () => {
      try {
        setLoading(true);
        const respuesta = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
        const detalles = await Promise.all(respuesta.data.results.map(async (pokemon) => {
          const resultado = await axios.get(pokemon.url);
          return resultado.data;
        }));
        setPokemons(detalles);
      } catch (error) {
        console.error('Error al obtener los Pokémon:', error);
      } finally {
        setLoading(false);
      }
    };
    obtenerPokemons();
  }, []);

  return (
    <div className="pokedex-container">
      <header className="pokedex-header">
        <span className="pokedex-label">POKÉMON DATABASE</span>
        <h1>Pokédex</h1>
        <p>Explora y descubre el mundo Pokémon.</p>
      </header>

      <section className="pokedex-content">
        {loading ? <p>Buscando Pokémon...</p> : (
          <div className="pokemon-grid">
            {pokemons.map((pokemon) => (
              <article className="pokemon-card" key={pokemon.id}>
                <span className="pokemon-number">#{String(pokemon.id).padStart(3, '0')}</span>
                <img src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} alt={pokemon.name} />
                <h3>{pokemon.name}</h3>
                <div className="pokemon-types">
                  {pokemon.types.map((tipo) => <span key={tipo.type.name}>{tipo.type.name}</span>)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Pokedex;
