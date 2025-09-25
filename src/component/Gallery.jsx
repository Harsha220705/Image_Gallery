import React, { useState } from 'react';
import { Col, Container, Row, Card, Button } from 'react-bootstrap'; // Import Button
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// 1. Accept the new onDeletePhoto function as a prop
function Gallery({ photos, onDeletePhoto }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openLightbox = (photoIndex) => {
    setIndex(photoIndex);
    setOpen(true);
  };

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">Gallery</h2>
      <Row>
        {photos.map((photo, photoIndex) => (
          <Col key={photo.id} md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Img 
                variant="top" 
                src={photo.src} 
                style={{ height: "250px", objectFit: "cover", cursor: 'pointer' }}
                onClick={() => openLightbox(photoIndex)}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{photo.title}</Card.Title>
                <Card.Text>{photo.description}</Card.Text>
                
                {/* 2. Add the Delete Button here */}
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="mt-auto"
                  onClick={(e) => {
                    e.stopPropagation(); // This is important! It stops the lightbox from opening when you click delete.
                    onDeletePhoto(photo.id);
                  }}
                >
                  Delete
                </Button>

              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={photos.map(p => ({ src: p.src, title: p.title }))}
        index={index}
      />
    </Container>
  );
}

export default Gallery;