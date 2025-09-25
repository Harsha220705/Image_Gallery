import React from 'react';
import { Container, Button, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./style.css";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="hero-section text-center text-white">
            <Container>
                <h1 className="display-3 fw-bold">Your Photo Gallery</h1>
                <p className="lead fs-4 mb-5">
                    Store, view, and manage your precious memories.
                </p>
                <Stack direction="horizontal" gap={3} className="justify-content-center">
                    <Button variant="primary" size="lg" onClick={() => navigate('/addphoto')}>
                        Add a New Photo
                    </Button>
                    <Button variant="outline-light" size="lg" onClick={() => navigate('/gallery')}>
                        View My Gallery
                    </Button>
                </Stack>
            </Container>
        </div>
    );
};

export default Home;