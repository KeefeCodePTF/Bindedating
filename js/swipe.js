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
      container.innerHTML = '';

      if (!matches.length) {
        container.innerHTML = "<p>No matches found.</p>";
        return;
      }

      matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'swipe-card';
        card.dataset.userid = match.id; // ✅ Required for swipe tracking

        card.innerHTML = `
          <h3>${match.profile.name}</h3>
          <p><strong>Gender:</strong> ${match.profile.gender}</p>
          <p><strong>Role:</strong> ${match.profile.role}</p>
          <p><strong>Bio:</strong> ${match.profile.description}</p>
        `;

        container.appendChild(card);
      });

      enableSwiping();
    });
});

function enableSwiping() {
  const cards = document.querySelectorAll('.swipe-card');

  cards.forEach(card => {
    let startX = 0, currentX = 0, isDragging = false;

    const handleGestureStart = (x) => {
      isDragging = true;
      startX = x;
      card.style.transition = 'none';
    };

    const handleGestureMove = (x) => {
      if (!isDragging) return;
      currentX = x - startX;
      card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;
    };

    const handleGestureEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      card.style.transition = 'transform 0.3s ease';

      if (Math.abs(currentX) > 120) {
        const direction = currentX > 0 ? 'like' : 'pass';
        card.style.transform = `translateX(${currentX > 0 ? 1000 : -1000}px) rotate(${currentX * 0.1}deg)`;
        setTimeout(() => {
          card.remove();
          handleSwipeResult(direction, card);
        }, 300);
      } else {
        card.style.transform = '';
      }

      currentX = 0;
    };

    // Mouse events
    card.addEventListener('mousedown', e => handleGestureStart(e.clientX));
    card.addEventListener('mousemove', e => handleGestureMove(e.clientX));
    card.addEventListener('mouseup', handleGestureEnd);
    card.addEventListener('mouseleave', () => { if (isDragging) handleGestureEnd(); });

    // Touch events
    card.addEventListener('touchstart', e => handleGestureStart(e.touches[0].clientX));
    card.addEventListener('touchmove', e => handleGestureMove(e.touches[0].clientX));
    card.addEventListener('touchend', handleGestureEnd);
  });
}

function handleSwipeResult(direction, card) {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const targetId = card.dataset.userid;

  fetch('/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, targetId, direction })
  });

  // You could show feedback here
  console.log(`${direction.toUpperCase()} → ${card.querySelector('h3')?.textContent}`);
}