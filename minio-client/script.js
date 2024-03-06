// `upload` iterates through all files selected and invokes a helper function called `retrieveNewURL`.
function upload() {
  // Get selected files from the input element.
  var files = document.querySelector("#selector").files;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    // Retrieve a URL from our server.
    retrieveNewURL(file, (file, url) => {
      // Upload the file to the server.
      uploadFile(file, url);
    });
  }
}

// `retrieveNewURL` accepts the name of the current file and invokes the `/presignedUrl` endpoint to
// generate a pre-signed URL for use in uploading that file:
function retrieveNewURL(file, cb) {
  fetch(`http://localhost:8080/preSignedUrlToUploadObject?name=${file.name}`)
    .then((response) => {
      response.text().then((url) => {
        cb(file, url);
      });
    })
    .catch((e) => {
      console.error(e);
    });
}

// ``uploadFile` accepts the current filename and the pre-signed URL. It then uses `Fetch API`
// to upload this file to S3 at `play.min.io:9000` using the URL:
function uploadFile(file, url) {
  if (document.querySelector("#status").innerText === "No uploads") {
    document.querySelector("#status").innerHTML = "";
  }
  fetch(url, {
    method: "PUT",
    body: file,
  })
    .then(() => {
      // If multiple files are uploaded, append upload status on the next line.
      document.querySelector(
        "#status"
      ).innerHTML += `<br>Uploaded ${file.name}.`;
    })
    .catch((e) => {
      console.error(e);
    });
}

function deleteObject() {
  const bucketName = document.getElementById("bucketname").value;
  const fileName = document.getElementById("filename").value;
  console.log("sdas");
  fetch(`http://localhost:8080/files/${bucketName}/${fileName}`, {
    method: "DELETE",
  })
    .then(() => {
      document.querySelector(
        "#delete-status"
      ).innerHTML += `<br>file delete successfully.`;
    })
    .catch((e) => {
      console.error(e);
    });
}
