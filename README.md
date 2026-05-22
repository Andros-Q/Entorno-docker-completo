Codigo:
Descripción del proyecto
Construcción de un Entorno Docker Controlado en Windows con WSL
● Arquitectura del entorno
Nuestra Arquitectura
Antes de ensuciarnos las manos con comandos, imagina que estamos
armando un pequeño edificio inteligente dentro de tu computadora. Para que
no te pierdas, así es como va a funcionar todo:
 Los Cimientos (Windows + WSL2 con Ubuntu): Es el terreno.
Hacemos que Windows le haga un espacio "nativo" a Linux para que
Docker se sienta en casa, corra rapidísimo y no consuma todos tus
recursos.
 El Pasillo Secreto (La Red mi_red_app): Vamos a crear una red
privada. Todos nuestros servicios estarán conectados aquí, de modo que
pueden hablar entre ellos usando solo sus nombres (como si se gritaran
por el pasillo), pero desde afuera nadie los puede molestar.
Los Habitantes (Nuestros Contenedores):
 El Recepcionista (Nginx - Puerto 8080): Es nuestro servidor web
básico. Su trabajo es mostrar las páginas HTML estáticas y saludar a los
que ingresan desde su navegador.
 El Cerebro (API en Node.js - Puerto 3000): Es tu backend. Aquí va tu
código; escucha las peticiones de los usuarios, piensa qué hacer y va a
pedirle datos a la base de datos.
 ࡏࡐࡑࡒࡓࡔࡕLa Bóveda (PostgreSQL - Puerto 5432): Aquí guardamos la
información real de tu app. Es un cuarto cerrado al que solo el "Cerebro"
(Node.js) y el "Administrador" (pgAdmin) tienen la llave para entrar.
 Las Cámaras de Seguridad (pgAdmin 4 - Puerto 5050): Es una
página web hermosa para ti. Te permite asomarte dentro de la bóveda
(PostgreSQL) para ver, editar o borrar datos sin tener que usar código
complejo en la consola.
 El Laboratorio Científico (Jupyter Lab - Puerto 8888): Un espacio
extra genial por si quieres analizar datos de tu base, probar código en
Python o hacer experimentos conectados a tu red.
El Salvavidas (El Volumen pg_data): Los contenedores son como tiendas de
campaña: si los quitas, se va todo lo de adentro. ¡Sería un desastre perder la
base de datos! Por eso crearemos un volumen (piénsalo como un disco duro
externo indestructible). Lo conectaremos a PostgreSQL, así que, si apagas y

Codigo:
limpias todo, la tienda se va, pero tu "disco duro" con los datos se queda a
salvo para la próxima vez que armes la tienda.

● Requisitos previos
Instalación y configuración de:
 WSL
 Ubuntu en Windows
 Docker Desktop o Docker Engine
 Docker Compose
 Git
● Pasos de instalación

1. Actualizamos la lista de programas e instalamos unas herramientas adicionales
sudo apt-get update
<img width="567" height="423" alt="image" src="https://github.com/user-attachments/assets/67226eed-61e0-4896-b13d-5e87378f2247" />

sudo apt-get install ca-certificates curl gnupg
<img width="600" height="368" alt="image" src="https://github.com/user-attachments/assets/9b501205-a1c2-4c57-a759-3a57e11d2752" />

Código:

2. Descargamos la "firma digital" de Docker para que Ubuntu confie en ellos
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -
o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
<img width="884" height="159" alt="image" src="https://github.com/user-attachments/assets/cf523028-6b03-40c9-ae0b-b54dadb0bf62" />

3. Añadimos el catálogo oficial de Docker a nuestro sistema
echo
"deb [arch="$(dpkg --print-architecture)" signed-
by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu
"$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" |
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
<img width="886" height="128" alt="image" src="https://github.com/user-attachments/assets/80d97e8d-e53b-4abd-bafe-f76ea8cfc1f7" />

Refrescamos la lista de programas una vez más
sudo apt-get update
<img width="961" height="251" alt="image" src="https://github.com/user-attachments/assets/f64499b9-d75d-4408-a909-139e0eaf5285" />

Código:

Creamos el grupo por si las dudas
sudo groupadd docker

Te agregamos a ese grupo ($USER es tu nombre de usuario automático)
sudo usermod -aG docker $USER

Instalamos todo el paquete de Docker y Docker Compose
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin
docker-compose-plugin
<img width="743" height="296" alt="image" src="https://github.com/user-attachments/assets/51886046-3568-4cef-9f9c-a9b71961db76" />
<img width="617" height="321" alt="image" src="https://github.com/user-attachments/assets/c06431f4-8ea2-490d-9329-159e09772625" />

Tomamos Docker a mano
sudo service docker start

Revisamos que si prendio el Docker
sudo service docker status

Deberías ver algo como: * Docker se está ejecutando
Código:

Creamos el grupo por si las dudas
sudo groupadd docker

Te agregamos a ese grupo ($USER es tu nombre de usuario automático)
sudo usermod -aG docker $USER

Checamos las versiones
docker --version
docker componer versión

Código:

Prueba clásica para rectificar que el entorno se descarga correctamente
docker run hello-world

 Capturas de Pantalla + Comandos Utilizados Para Montar el Docker
Armando el proyecto: Carpetas y archivos mágicos
El orden es súper importante para no volvernos locos después. Vamos a crear
las carpetas para nuestro proyecto.

Vamos a tu carpeta principal
CD ~

Creamos la carpeta del proyecto y entramos en ella
mkdir entorno-docker-completo
cd entorno-docker-completo

Creamos unas rugitas extra para el código
mkdir web
mkdir api-node

Código:

El archivo secreto .env
//Se crea un archivo para guardar las contraseñas del Docker a configurar y
montar.
nano .env
//Se pega lo siguiente en nano
POSTGRES_USER=andros_Q
POSTGRES_PASSWORD=Raichu
POSTGRES_DB=MyDataBase
PGADMIN_DEFAULT_EMAIL=admin@midominio.com
PGADMIN_DEFAULT_PASSWORD=adminpgadmin

//Luego presiono CTRL + O para guardar y CTRL + X para salir.

Código:

El corazón del proyecto: docker-compose.yml
//Se crea otro archivo donde va las configuraciones de los servicios que van a ir
en el docker
nano docker-compose.yml
//Poner los comandos de la configuración
versión: '3.8'

servicios:

1. Un servidor para páginas web (Nginx)
web_server:
imagen: nginx:latest
nombre_contenedor: servidor_web
puertos:


volúmenes "8080:80" :
./web:/usr/share/nginx/html
redes:
mi_red_app
reiniciar: siempre
2. El cerebro de la aplicación (Node.js)
api_node:
build: ./api-node
container_name: backend_api
ports:

Entorno "3000:3000"
:
DB_USER=${POSTGRES_USER}
Código:

DB_PASSWORD=${POSTGRES_PASSWORD}
DB_HOST=db_postgres
DB_NAME=${POSTGRES_DB}
depende_de:

redes db_postgres :
mi_red_app
3. Donde guardaremos la info (PostgreSQL)
db_postgres:
imagen: postgres:
nombre_contenedor: base_datos_pg
entorno:
POSTGRES_USER: ${POSTGRES_USER}
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
POSTGRES_DB: ${POSTGRES_DB}
puertos:


volúmenes "5432:5432" :
pg_data:/var/lib/postgresql/data
redes:
mi_red_app
reiniciar: siempre
4. Para ver la base de datos visualmente (pgAdmin)
pgadmin:
imagen: dpage/pgadmin
nombre_contenedor: administrador_pg
entorno:

Código:
PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL}
PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD}
puertos:

"5050:80"
depende_de:

redes db_postgres :
mi_red_app
reiniciar: siempre
5. Para jugar con datos y código (Jupyter Lab)
jupyter:
imagen: jupyter/base-notebook:latest
nombre_contenedor: jupyter_lab
puertos:

Entorno "8888:8888"
:
JUPYTER_ENABLE_LAB=sí
JUPYTER_TOKEN=root
redes:
mi_red_app
reiniciar: siempre
redes:
mi_red_app:
controlador: puente

volúmenes:
pg_data:

Código:

//Se guardó la configuración correctamente en docker-compose.yml.
Configurando cada servicio al detalle
//Colocando algo de contenido al contenedor web ya nuestra API
cd ~/entorno-docker-completo/web
nano index.html
//Configurando que va dentro de index.html

¡Hola! ¡Nginx funciona de maravilla en Docker!
Si lees esto, hiciste todo bien.

Código:

Nuestra API en Node.js

Hagamos el archivo package.json
//Abro nano para la creación del package.jason
nano package.json
//Coloco la siguiente configuración
{
"name": "api-prueba",
"version": "1.0.0",
"main": "index.js",
"dependencies": {
"express": "^4.18.2",
"pg": "^8.11.3"
}
}

Código:

Ahora el código index.js:
//Abro nano para la creación del index.js donde van a ir unos comandos
nano index.js
//Pongo esta configuración dentro del archivo

Código:

Crear el Dockerfile (que le enseña a Docker cómo armar Node):
//Crear carpeta para almacenar la información para armar el nodo
nano Dockerfile

Codigo:
Funcionamiento del Docker
//Regresar a la Carpeta Principal
cd ~/entorno-docker-completo
//Ejecuto el siguiente comando
docker compose up -d
//Comando que descarga lo que falta, arma todo y lo deja corriendo en el fondo
(-d es para que nos devuelva la consola).

//Aparecen los contenedores ya corriendo adecuadamente después de
descargar ejecutar este comando. También se descargaron un poco de cosas
extras.
 Evidencias de funcionamiento De que si funciona
//Estas son algunas capturas de que si funciona
Tu web: http://localhost:

 Tu API Node: http://localhost:
Código:

 Jupyter Lab: http://localhost:8888/lab?token=root
Utilizando comandos útiles del docker en Linux
docker ps // Mira quién está corriendo en este momento.

docker logs backend_api // Mira los mensajes de tu API.

Código:

docker logs backend_ap // Reinicia un servicio rápido.

docker compose restart // Apaga y limpia todo.

//Otra Evidencia del funcionamiento
