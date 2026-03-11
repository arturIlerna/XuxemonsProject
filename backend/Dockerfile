# backend/Dockerfile
FROM php:8.2-cli

# Instalar dependencias del sistema y extensiones PHP
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libsodium-dev \
    && docker-php-ext-install pdo_mysql zip sodium

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Exponer puerto (aunque artisan serve usará el 8000)
EXPOSE 8000