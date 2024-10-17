import './style.css';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {

    document.body.innerHTML = `
    <div class="container">
      <div class="box">
        <div class="top-box">
          <p class="text">FRC 7034 Trading Form</p>
        </div>
        <form class="trade-form">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required>
          <label for="team">Team/Affiliation: </label>
          <input type="text" id="team" name="team" required>
          <label for="contact">Contact Information:</label>
          <input type="text" id="contact" name="contact" required>
          <label for="offer">Trade Offer:</label>
          <input type="text" id="offer" name="offer" required>
          <label for="tradeFor">Trade Request:</label>
          <input type="text" id="tradeFor" name="tradeFor" required>
          <button type="submit" class="submit-button" disabled>Submit</button>
        </form>
      </div>
    </div>
  `;

    NET({
        el: "body",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 0.50,
        scaleMobile: 0.50,
        color: 0x1E5631,
        backgroundColor: 0x0B3D0B,
        points: 10.00,
        maxDistance: 20.00,
        spacing: 15.00,
        THREE: THREE
    });

    const form = document.querySelector<HTMLFormElement>('.trade-form');
    const submitButton = form?.querySelector<HTMLButtonElement>('.submit-button');

    const checkFormValidity = () => {
        const nameInput = document.querySelector<HTMLInputElement>('#name');
        const teamInput = document.querySelector<HTMLInputElement>('#team');
        const contactInput = document.querySelector<HTMLInputElement>('#contact');
        const offerInput = document.querySelector<HTMLInputElement>('#offer');
        const tradeForInput = document.querySelector<HTMLInputElement>('#tradeFor');

        if (nameInput?.value && teamInput?.value && contactInput?.value && offerInput?.value && tradeForInput?.value) {
            submitButton?.removeAttribute('disabled');
        } else {
            submitButton?.setAttribute('disabled', 'true');
        }
    };

    form?.addEventListener('input', checkFormValidity);

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nameInput = document.querySelector<HTMLInputElement>('#name');
        const teamInput = document.querySelector<HTMLInputElement>('#team');
        const contactInput = document.querySelector<HTMLInputElement>('#contact');
        const offerInput = document.querySelector<HTMLInputElement>('#offer');
        const tradeForInput = document.querySelector<HTMLInputElement>('#tradeFor');

        if (!nameInput || !teamInput || !contactInput || !offerInput || !tradeForInput) {
            console.error('One or more form elements are missing.');
            alert('Failed to submit form. Please try again.');
            return;
        }

        const name = nameInput.value;
        const team = teamInput.value;
        const contact = contactInput.value;
        const offer = offerInput.value;
        const tradeFor = tradeForInput.value;
        const payload = { name, team, contact, offer, tradeFor };

        submitButton?.setAttribute('disabled', 'true');

        try {
            const response = await fetch('/api/sendWebhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Too many requests. Please try again in a minute or two.');
                } else {
                    throw new Error('Network response was not ok');
                }
            }

            alert('Your form has been submitted, you may be contacted soon by a team member...');
            window.location.reload();
        } catch (error: unknown) {
            console.error('Error:', error);
            if (error instanceof Error) {
                if (error.message.includes('Too many requests')) {
                    alert('You have been rate-limited. Please try again in the next minute or two.');
                } else {
                    alert('There was an error submitting your form. Please try again later.');
                }
            } else {
                alert('An unknown error occurred. Please try again later.');
            }
            submitButton?.removeAttribute('disabled');
        }
    });

    submitButton?.removeAttribute('disabled');
});
