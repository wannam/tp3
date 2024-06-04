document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('upload-button');
    const downloadButton = document.getElementById('download-button');
    const backToMenuUpload = document.getElementById('back-to-menu-upload');
    const backToMenuDownload = document.getElementById('back-to-menu-download');
    
    const mainMenu = document.getElementById('main-menu');
    const uploadSection = document.getElementById('upload-section');
    const downloadSection = document.getElementById('download-section');

    const modal = document.getElementById('password-modal');
    const modalPasswordInput = document.getElementById('modal-password-input');
    const modalDownloadButton = document.getElementById('modal-download-button');
    const spanClose = document.getElementsByClassName('close')[0];

    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const passwordInput = document.getElementById('password-input');
    const filesList = document.getElementById('files-list');

    let currentFile = null;

    uploadButton.addEventListener('click', function() {
        mainMenu.style.display = 'none';
        uploadSection.style.display = 'block';
    });

    downloadButton.addEventListener('click', function() {
        mainMenu.style.display = 'none';
        downloadSection.style.display = 'block';
        loadFiles();
    });

    backToMenuUpload.addEventListener('click', function() {
        uploadSection.style.display = 'none';
        mainMenu.style.display = 'block';
        resetUploadForm();
    });

    backToMenuDownload.addEventListener('click', function() {
        downloadSection.style.display = 'none';
        mainMenu.style.display = 'block';
    });

    uploadForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const files = fileInput.files;
        const password = passwordInput.value;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }
        formData.append('password', password);

        fetch('upload.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(fileResponse => {
                if (fileResponse.error) {
                    alert(`Error: ${fileResponse.error}`);
                } else {
                    alert(fileResponse.message);
                }
            });
            resetUploadForm();
            loadFiles();
        });
    });

    function loadFiles() {
        fetch('list_files.php')
        .then(response => response.json())
        .then(files => {
            filesList.innerHTML = '';
            files.forEach(file => {
                const listItem = document.createElement('li');
                listItem.textContent = file.originalname + (file.hasPassword ? ' (Protegido)' : '');
                
                const downloadButton = document.createElement('button');
                downloadButton.textContent = 'Download';
                downloadButton.onclick = function() {
                    currentFile = file;
                    if (file.hasPassword) {
                        modal.style.display = 'block';
                    } else {
                        downloadFile(file.filename, '');
                    }
                };
                listItem.appendChild(downloadButton);
                filesList.appendChild(listItem);
            });
        });
    }

    spanClose.onclick = function() {
        modal.style.display = 'none';
        modalPasswordInput.value = '';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            modalPasswordInput.value = '';
        }
    }

    modalDownloadButton.onclick = function() {
        const password = modalPasswordInput.value;
        downloadFile(currentFile.filename, password);
    }

    function downloadFile(filename, password) {
        fetch('download.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename: filename, password: password })
        })
        .then(response => {
            if (response.status === 403) {
                alert("Senha inválida.");
                modalPasswordInput.value = '';
            } else if (response.status === 404) {
                alert("Arquivo não encontrado.");
                modal.style.display = 'none';
            } else {
                modal.style.display = 'none';
                modalPasswordInput.value = '';
                return response.blob();
            }
        })
        .then(blob => {
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = currentFile.originalname;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        });
    }

    function resetUploadForm() {
        uploadForm.reset();
        fileInput.value = '';
        passwordInput.value = '';
    }

    loadFiles();
});
