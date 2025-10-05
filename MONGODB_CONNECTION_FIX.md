# Solución: Error de conexión a MongoDB en Render

## Problema

```
Error: nasakb.yvrx6cs-shard-00-XX.mongodb.net:27017: [Errno -2] Name or service not known
```

El backend en Render no puede conectarse a MongoDB Atlas.

## Causa

Faltan las variables de entorno de MongoDB en el servicio de Render.

## Solución

### 1. Configurar Variables de Entorno en Render

1. **Ir a Render Dashboard:**
   - https://dashboard.render.com
   - Selecciona `nasa-rag-service`

2. **Ir a Environment Tab**

3. **Agregar variables:**
   ```env
   MONGODB_URI=mongodb+srv://<usuario>:<password>@nasakb.yvrx6cs.mongodb.net/<database>?retryWrites=true&w=majority
   ```

   O dependiendo de cómo esté configurado el backend:
   ```env
   MONGO_HOST=nasakb.yvrx6cs.mongodb.net
   MONGO_USER=tu_usuario
   MONGO_PASSWORD=tu_password
   MONGO_DATABASE=nombre_database
   MONGO_PORT=27017
   ```

4. **Guardar cambios**

### 2. Configurar Network Access en MongoDB Atlas

1. **Ir a MongoDB Atlas:**
   - https://cloud.mongodb.com
   
2. **Network Access → Add IP Address**

3. **Opciones:**
   
   **Opción A - Permitir todo (más fácil):**
   - Click en "Allow Access from Anywhere"
   - IP: `0.0.0.0/0`
   
   **Opción B - Solo IPs de Render (más seguro):**
   - Obtener IPs de Render desde su documentación
   - Agregar cada IP manualmente

### 3. Redeploy en Render

1. En Render Dashboard
2. Click en **Manual Deploy**
3. Selecciona **Deploy latest commit**
4. Espera 2-3 minutos

### 4. Verificar

1. Espera que el deploy termine
2. Ve a tu frontend en Vercel
3. Intenta hacer una búsqueda
4. Debería funcionar correctamente

## Verificación Rápida

### Probar la conexión del backend:

```bash
curl https://nasa-rag-service.onrender.com/diag/health
```

Debería responder:
```json
{
  "status": "ok",
  "message": "Service is running"
}
```

## Notas Importantes

- El backend necesita las credenciales de MongoDB para funcionar
- Sin la conexión a MongoDB, todas las peticiones al RAG fallarán
- Las variables de entorno deben estar configuradas ANTES de hacer deploy
- MongoDB Atlas requiere que las IPs estén en la whitelist

## Troubleshooting

### Si sigue sin funcionar:

1. **Verifica los logs de Render:**
   - Render Dashboard → Logs tab
   - Busca errores de conexión a MongoDB

2. **Verifica las credenciales:**
   - Usuario y password correctos
   - Database name correcto
   - Connection string completo

3. **Verifica Network Access en Atlas:**
   - La IP 0.0.0.0/0 debe estar en la lista
   - O las IPs específicas de Render

4. **Contacta al equipo del backend:**
   - Ellos tienen las credenciales correctas
   - Pueden configurar las variables de entorno

