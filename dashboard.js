document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const links = document.querySelectorAll('.navegacao a');

    links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('ativo');
        } else {
            link.classList.remove('ativo');
        }
    });
});

const connectionParams = new URLSearchParams(window.location.search);
const MQTT_HOST = connectionParams.get('mqttHost') || window.location.hostname || '10.0.0.247';
const MQTT_PORT = Number(connectionParams.get('mqttPort') || 9001);

const TOPIC_TEMP = 'aulas/gugu/temperatura';
const TOPIC_HUM = 'aulas/gugu/umidade';
const TOPIC_AIR = 'aulas/gugu/qualidade_ar';

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
        document.getElementById('temp').innerText = payload;
    } else if (topic === TOPIC_HUM) {
        document.getElementById('hum').innerText = payload;
    } else if (topic === TOPIC_AIR) {
        document.getElementById('air').innerText = payload;
    }
}
