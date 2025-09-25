import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./style.css";

const About = () => {
  const imgsrc =
    "https://cdn.pixabay.com/photo/2015/01/13/18/24/gate-598460_1280.jpg";

  return (
    <Container className="my-4 about-container">
      <Row className="about-row">
        {/* Left Section - 8 columns */}
        <Col md={8}>
          <h2>Team Owner</h2>
          <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Repellendus tempora commodi expedita, optio, fugiat cupiditate architecto quisquam perferendis rerum distinctio totam, illo animi iste porro dolorum dolore pariatur nisi natus?
          </p>
        </Col>

        {/* Right Section - 4 columns */}
        <Col md={4} className="text-center">
          <img
            className="img-fluid rounded shadow about-image"
            src={imgsrc}
            alt="Mysore Palace"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default About;