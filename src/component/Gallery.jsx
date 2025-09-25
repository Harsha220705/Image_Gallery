import React, { useMemo, useState } from 'react';
import { Col, Container, Row, Card, Button, Form, InputGroup, ListGroup } from 'react-bootstrap';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// 1. Accept the new onDeletePhoto function as a prop and loading state
function Gallery({ photos, onDeletePhoto, isLoading }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const openLightbox = (photoIndex) => {
    setIndex(photoIndex);
    setOpen(true);
  };

  const toDate = (createdAt) => {
    if (!createdAt) return null;
    // Firestore Timestamp from backend may appear as {_seconds, _nanoseconds}
    if (createdAt._seconds) {
      return new Date(createdAt._seconds * 1000);
    }
    // If already a number or ISO string
    try {
      return new Date(createdAt);
    } catch (_) {
      return null;
    }
  };

  const monthKey = (date) => {
    if (!date) return 'Unknown';
    const formatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
    return formatter.format(date);
  };

  const normalized = (s) => (s || '').toLowerCase();

  const filteredPhotos = useMemo(() => {
    const q = normalized(query);
    if (!q) return photos;
    return photos.filter(p => normalized(p.title).includes(q));
  }, [photos, query]);

  const suggestions = useMemo(() => {
    const q = normalized(query);
    if (!q) return [];
    const titles = Array.from(new Set(photos.map(p => p.title).filter(Boolean)));
    return titles
      .filter(t => normalized(t).includes(q))
      .slice(0, 6);
  }, [photos, query]);

  const groupedByMonth = useMemo(() => {
    const map = new Map();
    filteredPhotos.forEach((p, i) => {
      const d = toDate(p.createdAt) || new Date(0);
      const key = monthKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ photo: p, filteredIndex: i, date: d });
    });
    // Sort groups by date desc using first item or key parse
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const ad = a[1][0]?.date || new Date(0);
      const bd = b[1][0]?.date || new Date(0);
      return bd - ad;
    });
    return entries;
  }, [filteredPhotos]);

  const handleSelectSuggestion = (title) => {
    setQuery(title);
    setShowSuggestions(false);
    // Open first matching photo in lightbox
    const idx = filteredPhotos.findIndex(p => p.title === title);
    if (idx >= 0) openLightbox(idx);
  };

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">Gallery</h2>

      <div className="mb-4" style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
        <InputGroup>
          <Form.Control
            placeholder="Search by title..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
          />
          <Button variant="outline-secondary" onClick={() => setShowSuggestions(false)}>Search</Button>
        </InputGroup>
        {showSuggestions && suggestions.length > 0 && (
          <ListGroup style={{ position: 'absolute', left: 0, right: 0, zIndex: 10 }}>
            {suggestions.map((t) => (
              <ListGroup.Item key={t} action onClick={() => handleSelectSuggestion(t)}>
                {t}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>

      {isLoading && <p className="text-center">Loading photos...</p>}

      {groupedByMonth.map(([group, items]) => (
        <div key={group} className="mb-4">
          <h4 className="mb-3">{group}</h4>
          <Row>
            {items.map(({ photo, filteredIndex }) => (
              <Col key={photo.id} md={4} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Img 
                    variant="top" 
                    src={photo.src} 
                    style={{ height: "250px", objectFit: "cover", cursor: 'pointer' }}
                    onClick={() => openLightbox(filteredIndex)}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{photo.title}</Card.Title>
                    <Card.Text>{photo.description}</Card.Text>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="mt-auto"
                      onClick={(e) => {
                        e.stopPropagation();
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
        </div>
      ))}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={filteredPhotos.map(p => ({ src: p.src, title: p.title }))}
        index={index}
      />
    </Container>
  );
}

export default Gallery;