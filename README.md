<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>


# Teslo API

1. Clonar proyecto
2. ```yarn install```
3. Clonar el archivo ```.env.template``` y renombrarlo a ```.env```
4. Cambiar las variables de entorno en base al ambiente donde se esté desplegando
5. Levantar la base de datos
```
docker compose up -d
```

6. Levantar en modo de desarrollo: ```yarn start:dev```

7. Ejecutar SEED (**forceInsert=true** si se quiere sobreescribir la data)
```
GET http://localhost:3000/api/seed?forceInsert=true
```

