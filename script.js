let chart1, chart2;

function mostrarSeccion(seccionId) {
  document.querySelectorAll(".seccion").forEach(seccion => {
    seccion.classList.add("oculta");
  });
  document.getElementById(seccionId).classList.remove("oculta");
}
document.addEventListener("DOMContentLoaded", () => {
  mostrarSeccion('clima');
});

function actualizarClima() {
  fetch("https://few-mice-applying-incident.trycloudflare.com/getmediciones")
    .then(response => {
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        alert("No hay datos disponibles o el formato es incorrecto.");
        return;
      }

      // Obtener el número de datos a mostrar desde el combo box
      const numDatos = parseInt(document.getElementById("num-datos").value);
      const ultimos = data.slice(-numDatos);
      const ultima = ultimos[ultimos.length - 1];

      const etiquetas = ultimos.map((_, i) => "Dato " + (i + 1));
      const datosTemp = ultimos.map(v => v[1]);
      const datosHum = ultimos.map(v => v[2]);
      const datosViento = ultimos.map(v => v[4]);
      const datosPresion = ultimos.map(v => v[3]);

      const temperatura = ultima[1];
      const humedad = ultima[2];
      const presion = ultima[3];
      const precipitacion = ultima[6];

      document.getElementById("temperatura").textContent = temperatura + " °C";
      document.getElementById("humedad").textContent = humedad + " %";
      document.getElementById("velocidad-viento").textContent = ultima[4] + " m/s";
      document.getElementById("presion").textContent = presion + " hPa";

      // Destruir gráficos existentes si existen
      if (chart1 && typeof chart1.destroy === 'function') chart1.destroy();
      if (chart2 && typeof chart2.destroy === 'function') chart2.destroy();

      // Crear o actualizar el primer gráfico
      const ctx1 = document.getElementById("graficaTempHum").getContext("2d");
      chart1 = new Chart(ctx1, {
        type: "line",
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: "Temperatura (°C)",
              data: datosTemp,
              borderColor: "rgb(255, 234, 79)",
              backgroundColor: "rgba(235, 216, 74, 0.51)",
              fill: true
            },
            {
              label: "Humedad (%)",
              data: datosHum,
              borderColor: "rgba(255, 0, 153, 1)",
              backgroundColor: "rgba(255, 0, 153, 0.15)",
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            axis: 'x',
            intersect: false
          },
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Temperatura y Humedad" }
          }
        }
      });

      // Crear o actualizar el segundo gráfico
      const ctx2 = document.getElementById("graficaVientoPresion").getContext("2d");
      chart2 = new Chart(ctx2, {
        type: "line",
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: "Velocidad del Viento (m/s)",
              data: datosViento,
              borderColor: "rgb(11, 188, 237)",
              backgroundColor: "rgba(11, 188, 237, 0.38)",
              fill: true
            },
            {
              label: "Presión (hPa)",
              data: datosPresion,
              borderColor: "orange",
              backgroundColor: "rgba(239, 136, 52, 0.1)",
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            axis: 'x',
            intersect: false
          },
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Velocidad del Viento y Presión" }
          }
        }
      });

      const recomendaciones = [];
      if (temperatura > 32 || (temperatura > 25 && humedad > 70)) {
        recomendaciones.push("Mantente hidratado bebiendo agua regularmente.");
        recomendaciones.push("Evita actividades físicas al aire libre en horas calurosas.");
        recomendaciones.push("Usa ropa ligera y busca sombra o interiores.");
      } else if (precipitacion > 7.6) {
        recomendaciones.push("Lleva paraguas y evita zonas inundables.");
        recomendaciones.push("Revisa desagües en tu casa.");
      } else if (temperatura < 25 && precipitacion < 2.5) {
        recomendaciones.push("Buen clima para actividades al aire libre.");
      } else if (humedad > 70) {
        recomendaciones.push("Ventila bien los espacios cerrados.");
      } else {
        recomendaciones.push("El clima es adecuado. Mantente atento a cambios.");
      }

      const lista = document.getElementById("lista-recomendaciones");
      lista.innerHTML = "";
      recomendaciones.forEach(rec => {
        const li = document.createElement("li");
        li.textContent = rec;
        lista.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Error al obtener datos:", error);
      alert("No se pudo conectar con el servidor.");
    });
}
document.addEventListener("DOMContentLoaded", actualizarClima);
/* ============================================================
   MAPA METEOROLÓGICO (Leaflet + OpenWeatherMap)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // crea el mapa centrado en Los Cabos
  const map = L.map('map').setView([22.8905, -109.9167], 8);

  // capa base OpenStreetMap
  const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // tu API‑key de OpenWeatherMap
  const OWM_KEY = '7b19d948b9c6d3d453da47eb94f21126';

  // capas climáticas gratuitas
  const capaTemp  = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`, {
    opacity: 33.6, attribution: '&copy; OpenWeatherMap'
  });
  const capaNubes = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`, {
    opacity: 40.4, attribution: '&copy; OpenWeatherMap'
  });
  const capaLluvia = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`, {
    opacity: 40.4, attribution: '&copy; OpenWeatherMap'
  });
 
  const capaPresion = L.tileLayer(`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`, {
    opacity: 20.4, attribution: '&copy; OpenWeatherMap'
  });
  const capav = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`, {
    opacity: 60.4, attribution: '&copy; OpenWeatherMap'
  });

  // mostramos la temperatura por defecto
  capaTemp.addTo(map);

  // control para activar/desactivar capas
  const overlays = {
    '🌡️ Temperatura': capaTemp,
    '☁️ Nubes': capaNubes,
    '🌧️ Lluvia': capaLluvia,
    '🧭 Presion': capaPresion,
    '🌪️ Viento':capav

  };
  L.control.layers({ 'SkyReport': baseOSM }, overlays, { collapsed: false }).addTo(map);
});
