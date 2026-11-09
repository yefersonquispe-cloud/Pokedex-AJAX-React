import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Pokedex.css';

function Pokedex() {
  const [pokemons, setPokemons] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMatches, setSearchMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [pesoFiltro, setPesoFiltro] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('');
  const [offset, setOffset] = useState(20);
  const [hasMore, setHasMore] = useState(true);

  const obtenerDetalles = async (pokemon) => {
    const resultado = await axios.get(pokemon.url);
    const datos = resultado.data;
    const especie = await axios.get(datos.species.url);
    return { ...datos, genderRate: especie.data.gender_rate };
  };

  useEffect(() => {
    const obtenerPokemons = async () => {
      try {
        setLoading(true);
        const respuesta = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
        const detalles = await Promise.all(respuesta.data.results.map(obtenerDetalles));
        setPokemons(detalles);
        setHasMore(Boolean(respuesta.data.next));
      } catch (error) {
        console.error('Error al obtener los Pokémon:', error);
      } finally {
        setLoading(false);
      }
    };
    obtenerPokemons();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setSearchMatches([]);
      setOffset(20);
      setHasMore(true);
      return;
    }

    const buscarPokemons = async () => {
      try {
        setLoading(true);
        const respuesta = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=2000');
        const coincidencias = respuesta.data.results.filter((pokemon) => pokemon.name.includes(search.toLowerCase().trim()));
        const primeros = coincidencias.slice(0, 20);
        const detalles = await Promise.all(primeros.map(obtenerDetalles));
        setSearchMatches(coincidencias);
        setSearchResults(detalles);
        setOffset(20);
        setHasMore(coincidencias.length > 20);
      } catch (error) {
        console.error('Error en la búsqueda:', error);
        setSearchResults([]);
        setSearchMatches([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    const temporizador = setTimeout(buscarPokemons, 500);
    return () => clearTimeout(temporizador);
  }, [search]);

  const cargarMas = async () => {
    try {
      setLoadingMore(true);

      if (search.trim()) {
        const siguientes = searchMatches.slice(offset, offset + 20);
        const detalles = await Promise.all(siguientes.map(obtenerDetalles));
        setSearchResults((actuales) => [...actuales, ...detalles]);
        setOffset((actual) => actual + siguientes.length);
        setHasMore(offset + siguientes.length < searchMatches.length);
      } else {
        const respuesta = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
        const detalles = await Promise.all(respuesta.data.results.map(obtenerDetalles));
        setPokemons((actuales) => [...actuales, ...detalles]);
        setOffset((actual) => actual + detalles.length);
        setHasMore(Boolean(respuesta.data.next));
      }
    } catch (error) {
      console.error('Error al cargar más Pokémon:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const pokemonMostrados = search.trim() ? searchResults : pokemons;
  const pokemonsOrdenados = [...pokemonMostrados].sort((a, b) => a.name.localeCompare(b.name));

  const pokemonsFiltrados = pokemonsOrdenados.filter((pokemon) => {
    const coincideTipo = !tipoFiltro || pokemon.types.some((tipo) => tipo.type.name === tipoFiltro);
    const peso = pokemon.weight / 10;
    const coincidePeso = !pesoFiltro || (pesoFiltro === 'ligero' ? peso < 10 : pesoFiltro === 'medio' ? peso >= 10 && peso <= 50 : peso > 50);
    const coincideGenero = !generoFiltro || (generoFiltro === 'masculino' ? pokemon.genderRate >= 0 && pokemon.genderRate < 8 : generoFiltro === 'femenino' ? pokemon.genderRate > 0 : pokemon.genderRate === -1);
    return coincideTipo && coincidePeso && coincideGenero;
  });

  return (
    <div className="pokedex-container">
      <header className="pokedex-header">
        <span className="pokedex-label">POKÉMON DATABASE</span>
        <h1>Pokédex</h1>
        <p>Explora y descubre el mundo Pokémon.</p>
      </header>

      <section className="pokedex-search">
        <input type="text" placeholder="Buscar un Pokémon..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" onClick={() => setSearch(search.trim())}>Buscar</button>
      </section>

      <section className="pokemon-filters">
        <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
          <option value="">Todos los tipos</option>
          {['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>

        <select value={pesoFiltro} onChange={(e) => setPesoFiltro(e.target.value)}>
          <option value="">Todos los pesos</option>
          <option value="ligero">Menos de 10 kg</option>
          <option value="medio">Entre 10 y 50 kg</option>
          <option value="pesado">Más de 50 kg</option>
        </select>

        <select value={generoFiltro} onChange={(e) => setGeneroFiltro(e.target.value)}>
          <option value="">Todos los géneros</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="sin-genero">Sin género</option>
        </select>
      </section>

      <section className="pokedex-content">
        <div className="pokedex-info">
          <h2>Explorador Pokémon</h2>
          <span>{pokemonsFiltrados.length} Pokémon encontrados</span>
        </div>

        {loading ? <p>Buscando Pokémon...</p> : (
          <div className="pokemon-grid">
            {pokemonsFiltrados.length === 0 ? <p>No se encontraron Pokémon.</p> : pokemonsFiltrados.map((pokemon) => (
              <article className="pokemon-card" key={pokemon.id}>
                <span className="pokemon-number">#{String(pokemon.id).padStart(3, '0')}</span>
                <img src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} alt={pokemon.name} />
                <h3>{pokemon.name}</h3>
                <div className="pokemon-types">
                  {pokemon.types.map((tipo) => <span key={tipo.type.name}>{tipo.type.name}</span>)}
                </div>
                <div className="pokemon-stats">
                  <p><strong>Altura:</strong> {pokemon.height / 10} m</p>
                  <p><strong>Peso:</strong> {pokemon.weight / 10} kg</p>
                  <p><strong>Experiencia:</strong> {pokemon.base_experience ?? 'N/D'}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="load-more-container">
            <button className="load-more-button" onClick={cargarMas} disabled={loadingMore}>
              {loadingMore ? 'Cargando...' : 'Cargar más Pokémon'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Pokedex;