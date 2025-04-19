document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
    alert("You must log in first.");
    window.location.href = "/login";
    return;
  }

  fetch(`/potential-matches/${user.email}`)
    .then(res => res.json())
    .then(matches => {
      const container = document.getElementById('card-container');
      container.innerHTML = '';

      if (!matches.length) {
        container.innerHTML = "<p class='no-matches-msg'>Nobody in your area.</p>";
        return;
      }

      matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'swipe-card';
        card.dataset.userid = match.id;

        card.innerHTML = `
          <div class="swipe-media">
            <img src="${match.profile.media?.[0] || '/img/placeholder.jpg'}" alt="${match.profile.name}'s media">
          </div>
          <div class="swipe-info">
            <h3>${match.profile.name}, ${match.profile.age || '?'}</h3>
            <p><strong>${match.profile.role}</strong> • ${match.distance || '?'} miles away</p>
            <p class="bio">${match.profile.description || ''}</p>
          </div>
          <div class="icon-label">
            <i class="fas fa-times pass-icon" data-direction="pass"></i>
            <i class="fas fa-heart like-icon" data-direction="like"></i>
          </div>
        `;

        container.appendChild(card);
      });

      enableSwiping();
      setupIconButtons();
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

    card.addEventListener('mousedown', e => handleGestureStart(e.clientX));
    card.addEventListener('mousemove', e => handleGestureMove(e.clientX));
    card.addEventListener('mouseup', handleGestureEnd);
    card.addEventListener('mouseleave', () => { if (isDragging) handleGestureEnd(); });

    card.addEventListener('touchstart', e => handleGestureStart(e.touches[0].clientX));
    card.addEventListener('touchmove', e => handleGestureMove(e.touches[0].clientX));
    card.addEventListener('touchend', handleGestureEnd);
  });
}

function setupIconButtons() {
  document.querySelectorAll('.like-icon, .pass-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
      const card = e.target.closest('.swipe-card');
      const direction = e.target.dataset.direction;

      card.style.transform = `translateX(${direction === 'like' ? 1000 : -1000}px) rotate(${direction === 'like' ? 15 : -15}deg)`;
      setTimeout(() => {
        card.remove();
        handleSwipeResult(direction, card);
      }, 300);
    });
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

  console.log(`${direction.toUpperCase()} → ${card.querySelector('h3')?.textContent}`);
}
