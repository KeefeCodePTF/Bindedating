document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) {
      alert("You must log in first.");
      window.location.href = "/login";
      return;
    }
  
    fetch(`/matches/${user.email}`)
      .then(res => res.json())
      .then(matches => {
        const container = document.getElementById('card-container');
        if (!matches.length) {
          container.innerHTML = "<p>No matches found.</p>";
          return;
        }
  
        matches.forEach(match => {
          const card = document.createElement('div');
          card.className = 'swipe-card';
          card.innerHTML = `
            <h3>${match.profile.name}</h3>
            <p><strong>Gender:</strong> ${match.profile.gender}</p>
            <p><strong>Role:</strong> ${match.profile.role}</p>
            <p><strong>Bio:</strong> ${match.profile.description}</p>
          `;
          container.appendChild(card);
        });
  
        // Add swipe logic later
      });
  });