import React from "react";
import { Container, Form, Button } from "react-bootstrap";
import "./style.css";
const ContactUs = () => {
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Contact Us</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" id="name" placeholder="Your name" />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input type="email" className="form-control" id="email" placeholder="name@example.com" />
        </div>
        <div className="mb-3">
          <label htmlFor="subject" className="form-label">Subject</label>
          <input type="text" className="form-control" id="subject" placeholder="Subject" />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Message</label>
          <textarea className="form-control" id="message" rows="5" placeholder="Type your message"></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-100">Send</button>
      </form>
    </div>
  );
};

export default ContactUs;
