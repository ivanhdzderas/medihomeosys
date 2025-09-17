<?php

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { 
    header('Access-Control-Allow-Origin: *'); 
    header("Access-Control-Allow-Methods: OPTIONS,GET,PUT,POST,DELETE"); 
    header('Access-Control-Allow-Headers: Content-Type, Authorization'); 
    exit(0); 
} // Configuración de cabeceras CORS
 header('Access-Control-Allow-Origin: *'); 
 header('Content-Type: application/json'); 
 header("Access-Control-Allow-Methods: OPTIONS,GET,PUT,POST,DELETE"); 
 header('Access-Control-Allow-Headers: Content-Type, Authorization');
use Firebase\JWT\JWT;

require 'config.php'; // Archivo de configuración para las constantes de conexión


// Configuración de la base de datos
$dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_DATABASE . ";charset=utf8";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $db = new PDO($dsn, DB_USER, DB_PASSWORD, $options);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

// Rutas y lógica
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
array_splice($requestUri, 0, 1); // Elimina "BMW"
print_r($requestUri);
switch ($requestMethod) {
    case 'POST':
        if ($requestUri[0] === 'guardapaciente') {
            guardaPaciente();
        } elseif ($requestUri[0] === 'consultas') {
            guardaConsulta();
        } elseif ($requestUri[0] === 'events') {
            guardaEvento();
        } elseif ($requestUri[0] === 'medico' && $requestUri[1] === 'configuracion') {
            configuraMedico();
        } elseif ($requestUri[0] === 'login') {
            login();
        } elseif ($requestUri[0] === 'register') {
            register();
        }
        break;

    case 'GET':
        if ($requestUri[0] === 'getpacientes') {
            getPacientes();
        } elseif ($requestUri[0] === 'consultas' && isset($requestUri[1])) {
            getConsultas($requestUri[1]);
        } elseif ($requestUri[0] === 'events') {
            getEvents();
        } elseif ($requestUri[0] === 'medico' && $requestUri[1] === 'configuracion') {
            getMedicoConfig();
        } elseif ($requestUri[0] === 'pacientes') {
            getPacientes();
        }
        break;

    case 'DELETE':
        if ($requestUri[0] === 'events' && isset($requestUri[1])) {
            deleteEvento($requestUri[1]);
        } elseif ($requestUri[0] === 'pacientes' && isset($requestUri[1])) {
            deletePaciente($requestUri[1]);
        }
        break;

    case 'PUT':
        if ($requestUri[0] === 'pacientes' && isset($requestUri[1])) {
            updatePaciente($requestUri[1]);
        }
        break;
}

function guardaPaciente()
{
    global $db;
    $data = json_decode(file_get_contents("php://input"), true);

    $basicInfo = $data['basicInfo'];
    $familyHistory = $data['familyHistory'];
    $pathologicalHistory = $data['pathologicalHistory'];
    $nonPathologicalHistory = $data['nonPathologicalHistory'];
    $gynecologicalHistory = $data['gynecologicalHistory'];

    try {
        $db->beginTransaction();
        $stmt = $db->prepare('INSERT INTO pacientes SET nombre=:nombre, fecha_nacimiento=:fecha_nacimiento, direccion="", telefono=:telefono, email=:email, calle=:calle, ciudad=:ciudad, estado=:estado, codigo_postal=:codigo_postal, pais=:pais');
        $stmt->execute($basicInfo);
        $patientId = $db->lastInsertId();

        $histories = [
            'antecedentes_familiares' => $familyHistory,
            'antecedentes_patologicos' => $pathologicalHistory,
            'antecedentes_no_patologicos' => $nonPathologicalHistory,
            'antecedentes_ginecologicos' => $gynecologicalHistory,
        ];

        

        foreach ($histories as $table => $records) {
            if (count($records) > 0) {
                
                //
                foreach ($records as $record) {
                    switch($table){
                        case "antecedentes_familiares":
                            $stmt = $db->prepare("INSERT INTO antecedentes_familiares SET id_paciente=:id_paciente, relacion=:relacion, condicion=:condicion");
                            $record['id_paciente'] = $patientId;
                            $stmt->execute($record);
                            break;
                        case "antecedentes_patologicos":
                            $stmt = $db->prepare("INSERT INTO antecedentes_patologicos SET id_paciente=:id_paciente, condicion=:condicion, fecha_diagnostico=:fecha_diagnostico, tratamiento=:tratamiento, observaciones=:observaciones");
                            $record['id_paciente'] = $patientId;
                            $stmt->execute($record);
                            break;
                        case "antecedentes_no_patologicos":
                            $stmt = $db->prepare("INSERT INTO antecedentes_no_patologicos SET id_paciente=:id_paciente, habitos=:habitos, actividades_fisicas=:actividades_fisicas, dieta=:dieta");
                            $record['id_paciente'] = $patientId;
                            $stmt->execute($record);
                            break;
                        case "antecedentes_ginecologicos":
                            $stmt = $db->prepare("INSERT INTO antecedentes_ginecologicos SET id_paciente=:id_paciente, menarca=:menarca, ciclos_menstruales=:ciclos_menstruales, embarazos=:embarazos, partos=:partos, abortos=:abortos, antecedentes_familiares_ginecologicos=:antecedentes_familiares_ginecologicos");
                            $record['id_paciente'] = $patientId;
                            $stmt->execute($record);
                            break;
                    }
                    
                    //
                }
            }
        }

        $db->commit();
        echo json_encode(['message' => 'Paciente agregado exitosamente']);
    } catch (PDOException $e) {
        $db->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function getPacientes()
{
    global $db;
    try {
        $stmt = $db->query("SELECT * FROM pacientes");
        $pacientes = $stmt->fetchAll();
        echo json_encode($pacientes);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error al obtener pacientes']);
    }
}

function getConsultas($patientId)
{
    global $db;
    try {
        $stmt = $db->prepare('SELECT * FROM consultas WHERE id_paciente = ?');
        $stmt->execute([$patientId]);
        $consultas = $stmt->fetchAll();

        foreach ($consultas as &$consulta) {
            $consultaId = $consulta['id'];
            $uploadPath = "uploads/$patientId";
            $files = glob("$uploadPath/*-$consultaId.*");
            $consulta['archivos'] = $files ?: [];
        }

        echo json_encode($consultas);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error al obtener consultas']);
    }
}

function guardaConsulta()
{
    global $db;
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        $db->beginTransaction();
        $consulta = [
            'id_paciente' => $data['id_paciente'],
            'diagnostico' => $data['diagnostico'],
            'fecha' => $data['fecha'],
            'id_consulta_anterior' => $data['id_consulta_anterior'] ?? null,
        ];
        $stmt = $db->prepare('INSERT INTO consultas SET id_paciente=:id_paciente, diagnostico=:diagnostico, fecha=:fecha, id_consulta_anterior=:id_consulta_anterior');
        $stmt->execute($consulta);
        $id_consulta = $db->lastInsertId();

        foreach ($data['tratamientos'] as $tratamiento) {
            $tratamiento['id_consulta'] = $id_consulta;
            $stmt = $db->prepare('INSERT INTO tratamientos SET id_consulta=:id_consulta, tratamiento=:tratamiento');
            $stmt->execute($tratamiento);
        }

        $db->commit();
        echo json_encode(['message' => 'Consulta guardada correctamente']);
    } catch (PDOException $e) {
        $db->rollBack();
        echo json_encode(['error' => 'Error al guardar consulta']);
    }
}

function getEvents()
{
    global $db;
    try {
        $stmt = $db->query("SELECT * FROM events");
        $events = $stmt->fetchAll();
        echo json_encode($events);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error al obtener eventos']);
    }
}

function deleteEvento($id)
{
    global $db;
    try {
        $stmt = $db->prepare("DELETE FROM events WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Evento eliminado con éxito']);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error al eliminar evento']);
    }
}

function deletePaciente($id)
{
    global $db;
    try {
        $db->beginTransaction();

        $tables = [
            'antecedentes_familiares',
            'antecedentes_patologicos',
            'antecedentes_no_patologicos',
            'antecedentes_ginecologicos',
            'consultas',
            'events',
        ];
        foreach ($tables as $table) {
            $stmt = $db->prepare("DELETE FROM $table WHERE id_paciente = ?");
            $stmt->execute([$id]);
        }

        $stmt = $db->prepare("DELETE FROM pacientes WHERE id = ?");
        $stmt->execute([$id]);

        $db->commit();
        echo json_encode(['message' => 'Paciente y datos relacionados eliminados exitosamente']);
    } catch (PDOException $e) {
        $db->rollBack();
        echo json_encode(['error' => 'Error al eliminar paciente']);
    }
}

function login()
{
    global $db;
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        $stmt = $db->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['password'], $user['password'])) {
            echo json_encode(['message' => 'Inicio de sesión exitoso']);
        } else {
            echo json_encode(['error' => 'Credenciales incorrectas']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error al iniciar sesión']);
    }
}

function register()
{
    global $db;
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO usuarios SET email=:email, password=:password");
        $stmt->execute([
            'email' => $data['email'],
            'password' => $hashedPassword,
        ]);

        echo json_encode(['message' => 'Registro exitoso']);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Error al registrar usuario']);
    }
}
?>
