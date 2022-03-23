const socket = io();
let usuario = '';
socket.on('Bienvenida', (data) => {
    $('#status').text(data.msg);
    $('#titulo').text(data.titulo);
    usuario = data.us;
    if(usuario!='') {
        $('#usuario').val(usuario);
        $('#idUsuario').hide();
    } else {
        $('#usuario').val('');
        $('#idUsuario').show();
    }
    $('#alertType').hide();
});

socket.on('mensajes', (data) => {
    $('#alertType').hide();
    if (data!= null) {
        let html = '';
        let usUltimoMsg = '';
        if (data.length>0 && Array.isArray(data)) {
            usUltimoMsg = data[0]['us'];
        }
        data.map( m => {
            if ($('#usuario').val()==m.us) {
                html += `<div class="card text-white text-end bg-success my-2 ms-5" style="width: 75%;">
                    <div class="card-header">de: <span class="nombre">${m.us}</span> el ${m.fh}☑☑</div>
                    <div class="card-body">
                        <span class="card-text">${m.msg}</apan>`
                if (m.adj) {
                    html += `<a href="/descarga/${m.nombre}" class="btn btn-sm btn-primary text-white ms-2"><i class="bi bi-cloud-download"></i> Descargar</a>`
                }
                html += `</div>`
            } else {
                html += `<div class="card text-dark bg-info my-2 ms-1" style="width: 75%;">
                    <div class="card-header">✔✔de: <span class="nombre">${m.us}</span> el ${m.fh}</div>
                    <div class="card-body">
                        <span class="card-text">${m.msg}</span>`;
                    if (m.adj) {
                        html += `<a href="/descarga/${m.nombre}" class="btn btn-sm btn-primary text-dark ms-2"><i class="bi bi-cloud-download-fill"></i> Descargar</a>`
                    }
                    html += `</div>`
            }
            html += '</div>';
        })
        $('#msgs').html(html);
        if (usUltimoMsg!=$('#usuario').val()) {
            sonido('nuevo');
        }
    }
});

const enviar = () => {
    const usuario = document.getElementById('usuario');    
    if (usuario.value=='') {
        alert('INGRESÁ USUARIO');
        return;
    }
    const mensaje = document.getElementById('mensaje');
    if (mensaje.value=='') {
        alert('INGRESÁ UN MENSAJE');
        return;
    }  
    socket.emit('mensajeFront', {us: usuario.value, msg: mensaje.value, adj: false, nombre:''});  
    sonido('envio');  
    mensaje.value = '';
}

const regUsuario = () => {
    const usuario = document.getElementById('usuario');
    if (usuario.value=='') {
        alert('INGRESÁ USUARIO');
        $('#idUsuario').show();
        return;
    } else {
        $('#idUsuario').hide();
        $('#status').text(`Bienvenido ${usuario.value}`)
    }
}

document.querySelector('#myFile').addEventListener('change', event => {
    handleImageUpload(event)
})

const handleImageUpload = async (event) => {
    const files = event.target.files
    for await (let f of files) {
        const formData = new FormData()
        formData.append('myFile', f)
        await fetch('/subir', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const usuario = document.getElementById('usuario');    
            socket.emit('mensajeFront', {us: usuario.value, msg: `Envío de Archivo: ${data.filename}`, adj: true, nombre: data.filename})
        })
        .catch(error => {
            console.error(error)
        })
    }
    sonido('envio');  
}

const descargarAdj = (nombre) => {
    fetch(`/descarga/${nombre}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })
    .catch(error => {
        console.error(error)
    })
}

document.querySelector('#mensaje').addEventListener('keypress', event => {
    const usuario = document.getElementById('usuario');    
    socket.emit('typingFront', {us: usuario.value});      
})

socket.on('typingBack', (data) => {
    if (data!= null) {
        $('#alertType').show();
        let html = `<span><strong>${data.us}</strong> está escribiendo ... <strong>${data.fh}</strong></span>` ;
        $('#textoAlertType').html(html);
    }
});

soundManager.onload = () => {
    soundManager.createSound({ 
       id:'nuevo',
       url: 'nuevoMsg.wav',
       useHTML5Audio: true,
       preferFlash: false
    });
    soundManager.createSound({ 
        id:'envio',
        url: 'envioMsg.wav',
        useHTML5Audio: true,
        preferFlash: false
     });
} 

function sonido(nombre) {
    if ($('#sonido').prop('checked')) {
        soundManager.play(nombre)
    }
};

function activarSonido() {
    $('#activar').hide();
}

const verConectados = () => {
    socket.emit('verConectadosFront');
}

socket.on('VerConectadosBack', (data) => {
    $('#alertType').hide();
    if (data!= null) {
        let html = '';
        data.map( u => {
            html += `<tr>
                        <td>${u.us}</td>
                        <td>${u.fh}</td>
                    </tr>`
        })
        $('#tablaConectados').html(html);
    }
    $('#conectados').modal('show');
});

