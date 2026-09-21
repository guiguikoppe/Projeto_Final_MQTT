document.addEventListener('DOMContentLoaded', () => {
    const currentPage = (window.location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
    const links = document.querySelectorAll('.navegacao a, .menu a, .dashboard-nav a');

    links.forEach((link) => {
        const href = (link.dataset.page || link.getAttribute('href') || '').toLowerCase();
        const isActive = href === currentPage || href === currentPage.replace(/\\/g, '');

        link.classList.toggle('ativo', isActive);
        link.classList.toggle('active', isActive);
    });
});

const connectionParams = new URLSearchParams(window.location.search);
const MQTT_HOST = connectionParams.get('mqttHost') || window.location.hostname || '10.0.0.247';
const MQTT_PORT = Number(connectionParams.get('mqttPort') || 9001);

const TOPIC_TEMP = 'aulas/gugu/temperatura';
const TOPIC_HUM = 'aulas/gugu/umidade';
const TOPIC_AIR = 'aulas/gugu/qualidade_ar';
const SENSOR_STORAGE_KEY = 'dashboardSensorData';
const GROUP_DATA = {
    name: 'Grupo 01',
    members: ['Davi Sanches', 'Danilo', 'Gustavo', 'Leonardo', 'Luiz']
};

const sensorData = loadSensorData();
localStorage.setItem(SENSOR_STORAGE_KEY, JSON.stringify(sensorData));
updateDashboard(sensorData);

const clientID = 'WebDash_' + Math.random().toString(16).substr(2, 8);
const statusDiv = document.getElementById('status');

let client;

if (!window.Paho || !window.Paho.MQTT) {
    statusDiv.innerText = 'Status: Biblioteca MQTT indisponível';
} else {
    client = new Paho.MQTT.Client(MQTT_HOST, MQTT_PORT, clientID);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({
        onSuccess: onConnect,
        onFailure: onFailure,
        useSSL: window.location.protocol === 'https:'
    });
}

function onConnect() {
    statusDiv.innerText = 'Status: Conectado ao Mosquitto';
    statusDiv.className = 'status connected';

    client.subscribe(TOPIC_TEMP);
    client.subscribe(TOPIC_HUM);
    client.subscribe(TOPIC_AIR);
}

function onFailure(responseObject) {
    statusDiv.innerText = 'Status: Falha na conexão (' + responseObject.errorMessage + ')';
    statusDiv.className = 'status disconnected';
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        statusDiv.innerText = 'Status: Conexão Perdida';
        statusDiv.className = 'status disconnected';
    }
}

function onMessageArrived(message) {
    const topic = message.destinationName;
    const payload = message.payloadString;

    if (topic === TOPIC_TEMP) {
        sensorData.temperature = payload;
    } else if (topic === TOPIC_HUM) {
        sensorData.humidity = payload;
    } else if (topic === TOPIC_AIR) {
        sensorData.airQuality = payload;
    }

    sensorData.updatedAt = new Date().toISOString();
    localStorage.setItem(SENSOR_STORAGE_KEY, JSON.stringify(sensorData));
    updateDashboard(sensorData);
}

function loadSensorData() {
    const storedData = localStorage.getItem(SENSOR_STORAGE_KEY);

    if (!storedData) {
        return {
            temperature: '--',
            humidity: '--',
            airQuality: '--',
            updatedAt: null,
            group: GROUP_DATA
        };
    }

    try {
        return {
            temperature: '--',
            humidity: '--',
            airQuality: '--',
            updatedAt: null,
            group: GROUP_DATA,
            ...JSON.parse(storedData)
        };
    } catch (error) {
        localStorage.removeItem(SENSOR_STORAGE_KEY);
        return loadSensorData();
    }
}

function updateDashboard(data) {
    document.getElementById('temp').innerText = data.temperature;
    document.getElementById('hum').innerText = data.humidity;
    document.getElementById('air').innerText = data.airQuality;
    document.getElementById('group').innerText = `${data.group.name} = [${data.group.members.join('], [')}]`;
}
