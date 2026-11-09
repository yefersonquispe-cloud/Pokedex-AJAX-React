import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';

function CharacterLoader() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadCharacters = () => {
        setLoading(true);

        // Simulamos una petición Ajax para obtener los personajes de Star Wars
        axios
            .get('https://swapi.dev/api/people/')
            .then((response) => {
                setCharacters(response.data.results);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    };

    return (
        <Container>
            <h1>Personajes de Star Wars</h1>
            <button onClick={loadCharacters} disabled={loading}>
                {loading ? 'Cargando Personajes...' : 'Cargar Personajes'}
            </button>
            <Row>
                {characters.map((character, index) => (
                    <Col key={index} xs={12} sm={6} md={4} lg={3}>
                        <Card>
                            <Card.Body>
                                <Card.Title>{character.name}</Card.Title>
                                <Card.Text>
                                    <strong>Género:</strong> {character.gender}<br />
                                    <strong>Año de nacimiento:</strong> {character.birth_year}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default CharacterLoader;