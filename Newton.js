let carMoving = false;
let isPaused = false;
let animationFrameId;
let previousTimestamp = null;
let distanceTravelled = 0;
let totalTime = 0;
let velocity = 0;
let acceleration = 0;

// Default values
const defaultValues = {
    mass: 100,
    frictionCoefficient: 0,
    thrust: 100
};

// Event listeners
document.getElementById('simulate').addEventListener('click', startSimulation);
document.getElementById('reset').addEventListener('click', reset);
document.getElementById('togglePause').addEventListener('click', togglePause);

document.getElementById('massValue').addEventListener('input', () => updateDisplayValue('massValue', 'massDisplay'));
document.getElementById('frictionValue').addEventListener('input', () => updateDisplayValue('frictionValue', 'frictionDisplay', 2));
document.getElementById('forceValue').addEventListener('input', () => updateDisplayValue('forceValue', 'forceDisplay'));


function startSimulation() {
    if (carMoving) return;

    const mass = parseFloat(document.getElementById('massValue').value);
    const frictionCoefficient = parseFloat(document.getElementById('frictionValue').value);
    const thrust = parseFloat(document.getElementById('forceValue').value);

    const frictionForce = frictionCoefficient * mass * 9.8;

    if (thrust <= frictionForce) {
        alert(`Lực đẩy không đủ để di chuyển xe. Bạn cần ít nhất ${Math.ceil(frictionForce / 10) * 10} N để xe có thể di chuyển.`);
        return;
    }

    document.querySelectorAll('input[type="range"]').forEach(input => input.disabled = true);
    document.getElementById('acceleration').textContent = '0';

    distanceTravelled = 0;
    totalTime = 0;
    velocity = 0;
    acceleration = 0;
    carMoving = true;
    isPaused = false;
    document.getElementById('togglePause').disabled = false;
    document.getElementById('simulate').disabled = true;
    previousTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(moveCar);
}

function moveCar(timestamp) {
    if (!carMoving || isPaused) return;

    const deltaTime = (timestamp - previousTimestamp) / 1000;
    previousTimestamp = timestamp;

    const mass = parseFloat(document.getElementById('massValue').value);
    const frictionCoefficient = parseFloat(document.getElementById('frictionValue').value);
    const thrust = parseFloat(document.getElementById('forceValue').value);

    // Calculate friction force
    const frictionForce = frictionCoefficient * mass * 9.8;

    // Calculate net force
    let netForce = thrust - frictionForce;

    // Determine acceleration based on net force
    if (velocity === 0 && netForce <= 0) {
        acceleration = 0;
        velocity = 0;
    } else {
        acceleration = netForce / mass;

        // Update velocity
        velocity += acceleration * deltaTime;

        // Ensure velocity doesn't go negative
        if (velocity < 0) {
            velocity = 0;
            acceleration = 0;
        }

        // Update distance
        distanceTravelled += velocity * deltaTime;
    }

    totalTime += deltaTime;

    updateSimulationDisplay(velocity, distanceTravelled, totalTime, acceleration);
    moveCarElement(velocity, deltaTime);

    animationFrameId = requestAnimationFrame(moveCar);
}

function reset() {
    updateValue('massValue', defaultValues.mass);
    updateValue('frictionValue', defaultValues.frictionCoefficient);
    updateValue('forceValue', defaultValues.thrust);

    document.getElementById('acceleration').textContent = '0';
    updateSimulationDisplay(0, 0, 0, 0);
    resetCarPosition();

    carMoving = false;
    isPaused = false;
    distanceTravelled = 0;
    totalTime = 0;
    velocity = 0;
    acceleration = 0;
    previousTimestamp = null;

    document.getElementById('togglePause').textContent = 'Tạm dừng';
    document.getElementById('simulate').disabled = false;
    document.querySelectorAll('input[type="range"]').forEach(input => input.disabled = false);
    cancelAnimationFrame(animationFrameId);
    document.getElementById('togglePause').disabled = true;
}

function togglePause() {
    if (!carMoving) return;

    isPaused = !isPaused;
    document.getElementById('togglePause').textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';

    if (!isPaused) {
        previousTimestamp = performance.now();
        animationFrameId = requestAnimationFrame(moveCar);
    }
}

function updateValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
        const displayIdMap = {
            'massValue': 'massDisplay',
            'frictionValue': 'frictionDisplay',
            'forceValue': 'forceDisplay'
        };
        const displayId = displayIdMap[id];
        updateDisplayValue(id, displayId, id === 'frictionValue' ? 2 : 0);
    }
}

function updateDisplayValue(inputId, displayId, decimalPlaces = 0) {
    const inputElement = document.getElementById(inputId);
    const displayElement = document.getElementById(displayId);
    if (inputElement && displayElement) {
        const value = parseFloat(inputElement.value).toFixed(decimalPlaces);
        displayElement.textContent = value;
    }
}

function updateSimulationDisplay(velocity, distance, time, acceleration) {
    document.getElementById('velocity').textContent = velocity.toFixed(2);
    document.getElementById('distance').textContent = distance.toFixed(2);
    document.getElementById('time').textContent = time.toFixed(2);
    document.getElementById('acceleration').textContent = acceleration.toFixed(2);
}

function moveCarElement(velocity, deltaTime) {
    const road = document.getElementById('road');
    let backgroundPositionX = parseFloat(getComputedStyle(road).backgroundPositionX) || 0;
    backgroundPositionX -= velocity * deltaTime * 100; // Adjust the factor to control scrolling speed

    road.style.backgroundPositionX = `${backgroundPositionX}px`;
}

function resetCarPosition() {
    const road = document.getElementById('road');
    road.style.backgroundPositionX = '0px';
}

function toggleAdditionalConditions() {
    const additionalConditions = document.getElementById('additionalConditions');
    const checkbox = document.getElementById('conditionCheckbox');
    additionalConditions.style.display = checkbox.checked ? 'flex' : 'none';
}

// JavaScript for help icons
document.querySelectorAll('.help-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        icon.classList.toggle('active');
    });
});
