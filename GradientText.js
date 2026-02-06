class GradientText {
  constructor(element, options = {}) {
    this.element = element;
    this.colors = options.colors || ['#56a9ff', '#b561ff', '#ffcb58', '#40cb7a'];
    this.animationSpeed = options.animationSpeed || 8;
    this.showBorder = options.showBorder || false;
    this.direction = options.direction || 'horizontal';
    this.pauseOnHover = options.pauseOnHover || false;
    this.yoyo = options.yoyo !== false; // Default true
    this.uniqueId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
    
    this.init();
  }

  init() {
    // Wrap the text content
    if (!this.element.classList.contains('animated-gradient-text')) {
      const content = this.element.innerHTML;
      this.element.classList.add('animated-gradient-text');
      if (this.showBorder) {
        this.element.classList.add('with-border');
      }
      
      this.element.innerHTML = `
        ${this.showBorder ? '<div class="gradient-overlay"></div>' : ''}
        <div class="text-content">${content}</div>
      `;
      
      this.textContent = this.element.querySelector('.text-content');
      this.gradientOverlay = this.element.querySelector('.gradient-overlay');
    } else {
      this.textContent = this.element.querySelector('.text-content');
      this.gradientOverlay = this.element.querySelector('.gradient-overlay');
    }
    
    // Setup gradient style and animation
    this.setupAnimation();
    
    // Setup event listeners for pause on hover
    if (this.pauseOnHover) {
      this.element.addEventListener('mouseenter', () => this.element.style.animationPlayState = 'paused');
      this.element.addEventListener('mouseleave', () => this.element.style.animationPlayState = 'running');
    }
  }

  setupAnimation() {
    const gradientAngle = 
      this.direction === 'horizontal' ? 'to right' : 
      this.direction === 'vertical' ? 'to bottom' : 
      'to bottom right';
    
    // Create gradient with duplicated first color for seamless looping
    const gradientColors = [...this.colors, this.colors[0]].join(', ');
    const gradientString = `linear-gradient(${gradientAngle}, ${gradientColors})`;
    
    // Set background size and image - increased to 400% to show all colors better
    const backgroundSize = 
      this.direction === 'horizontal' ? '400% 100%' : 
      this.direction === 'vertical' ? '100% 400%' : 
      '400% 400%';
    
    this.textContent.style.backgroundImage = gradientString;
    this.textContent.style.backgroundSize = backgroundSize;
    this.textContent.style.backgroundRepeat = 'repeat';
    this.textContent.style.animation = `gradient-shift-${this.direction} ${this.animationSpeed}s ease-in-out ${this.yoyo ? 'alternate' : 'normal'} infinite`;
    
    if (this.gradientOverlay) {
      this.gradientOverlay.style.backgroundImage = gradientString;
      this.gradientOverlay.style.backgroundSize = backgroundSize;
      this.gradientOverlay.style.backgroundRepeat = 'repeat';
      this.gradientOverlay.style.animation = `gradient-shift-${this.direction} ${this.animationSpeed}s ease-in-out ${this.yoyo ? 'alternate' : 'normal'} infinite`;
    }
    
    // Inject CSS keyframe animation if not already present
    this.injectKeyframes();
  }

  injectKeyframes() {
    // Check if keyframes already exist
    const styleId = 'gradient-text-keyframes';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    
    const keyframes = `
      @keyframes gradient-shift-horizontal {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      @keyframes gradient-shift-vertical {
        0% { background-position: 50% 0%; }
        100% { background-position: 50% 100%; }
      }
      @keyframes gradient-shift-diagonal {
        0% { background-position: 0% 0%; }
        100% { background-position: 100% 100%; }
      }
    `;
    
    style.textContent = keyframes;
    document.head.appendChild(style);
  }

  destroy() {
    this.element.style.animation = 'none';
  }

  setColors(colors) {
    this.colors = colors;
    this.setupAnimation();
  }

  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
    this.setupAnimation();
  }

  setDirection(direction) {
    this.direction = direction;
    this.setupAnimation();
  }
}

// Auto-initialize all elements with data-gradient-text attribute
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-gradient-text]').forEach(element => {
    const options = {
      colors: element.dataset.colors ? element.dataset.colors.split(',').map(c => c.trim()) : ['#56a9ff', '#b561ff', '#ffcb58', '#40cb7a'],
      animationSpeed: parseFloat(element.dataset.animationSpeed) || 8,
      showBorder: element.dataset.showBorder === 'true',
      direction: element.dataset.direction || 'horizontal',
      pauseOnHover: element.dataset.pauseOnHover === 'true',
      yoyo: element.dataset.yoyo !== 'false'
    };
    new GradientText(element, options);
  });
});
