#!/bin/bash

# Start SQL Server
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to fully start (max 90 seconds)
for i in {1..90}; do
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'PhanHoangQuanzzz123@' -Q "SELECT 1" -C -v TrustServerCertificate=yes &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ SQL Server is up - executing init script"
        break
    fi
    echo "⏳ Waiting for SQL Server to start..."
    sleep 1
done

# Check if SQL Server is ready
if [ $? -ne 0 ]; then
    echo "❌ SQL Server did not start in time"
    exit 1
fi

# Execute the database initialization script if it exists
if [ -f /docker-entrypoint-initdb.d/init-db.sql ]; then
    echo "▶️ Running init-db.sql..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'PhanHoangQuanzzz123@' -d master -i /docker-entrypoint-initdb.d/init-db.sql -C -v TrustServerCertificate=yes
    if [ $? -eq 0 ]; then
        echo "✅ Database initialization completed"
    else
        echo "❌ Error executing init-db.sql"
        exit 1
    fi
else
    echo "⚠️ No init-db.sql file found, skipping initialization"
fi

# Keep the container running
echo "🟢 Container is running..."
exec tail -f /dev/null
