window.addEventListener("DOMContentLoaded", () => obtenerLexemas());
const lexico = document.getElementById("datos");
const sintac = document.getElementById("aSintactico");
const generador = document.getElementById("gCodigo");
let codigo = document.getElementById("codigo");
let cCodigo = document.getElementById("container_codigo");
let lexemas;
let tokens = [];

/* obteniendo la informacion de la bd y pasandola a una variable local */
const obtenerLexemas = async () => {
  try {
    const rs = await fetch("./lexemas.json");
    const data = await rs.json();
    lexemas = data;
  } catch (error) {
    // console.log(error);
  }
};

/* buscar palabra en lexemas */
function buscar(listaDePalabras) {
  let subTokens =[];
  // console.log (lexemas);
  /* recorrer la lista que nos pasan */
  listaDePalabras.forEach((palabra)=>{
    /* combrobar si la palabra se encuentra en la bd lexemas */
    lexemas.some((item)=> item.nombre == palabra)?
    lexemas.filter((item) => {
      if (item.nombre == palabra) {
        subTokens.push(item);
      }
    })
    /* combrobar si la palabra noencontrada no es un string vacio*/
    : comprobarPalabraNoEncontrada(palabra) !== undefined ?
      subTokens.push(comprobarPalabraNoEncontrada(palabra)):
       console.log('es un string vacio')
      ;
  });
  tokens.push(subTokens);
  lexico.innerHTML=``;
  tokens.forEach(item=>{
    lexico.innerHTML+=`
      <tr>
      <td class='linea text-body-1' colspan='3'>
      Linea ${tokens.indexOf(item) + 1}
      </td>
      </tr>`
    item.forEach(item=>{
      lexico.innerHTML+=`
      <tr>
      <td class="text-body-1">
          ${item.nombre}
      </td>
      <td class="text-body-1">
        ${item.tipo}
      </td>
    </tr>`;
    })
  })
}

/*  funcion que compara las palabras no encontradas*/
function comprobarPalabraNoEncontrada(palabra){
/*   console.log('No se encontro',palabra); */
  let temp;
  /* comprueba si no es un string vacio y no es un numero */
  if(palabra !== '' && isNaN(palabra)){
    temp = {
      nombre: palabra,
      tipo: "identidicador",
    }
  /* comprueba si no es un string vacio y si es un numero */
  }else if (palabra !== '' && !isNaN(palabra)){
    temp = {
      nombre: palabra,
      tipo: "numero",
    }
  }
  return temp;
}

/* funcion que divide el texto en bloque de codigo */
function dividirBloque(cadenas){
  let bloques = cadenas.split(';\n')
  // console.log(bloques);
  
  return bloques;
}
/* funcion que separa los casos */
/*
function comprobarCaso(bloques){
  let respuestas = [];
  let respuesta;
  let i=0;
  bloques.forEach(item=>{
    item.startsWith('if')?
      item.match(/if\(\s*?\w+\s*?[=|==|<=|>=|===|!=|!==]+\s*?\w+\s*?\){\s?(.*\s*?)*};?/g)?
        respuesta =[i+1,'Compila correctamente el if']:
        respuesta =[i+1,`El bloque de codigo ${bloques.indexOf(item)+1} es incorrecta`]
    : item.startsWith('const') |item.startsWith('var') |item.startsWith('let')?
        item.match(/[const|var|let] \D=?\s?\w+?;?\s?/)?
        respuesta =[i+1,'Compila correctamente la declaración de variable']:
        respuesta =[i+1,`El bloque de codigo ${bloques.indexOf(item)+1} es incorrecta`]
    :item.match(/\D\s?=\s?\w+;?\s?/g)?
        respuesta =[i+1,'se inicializo correctamente']
    :respuesta =[i+1,'no reconosco esta sintaxis']
    respuestas.push(respuesta);
    // console.log(respuestas);
    i++;
  })
  sintac.innerHTML=``;
  respuestas.forEach(item=>{
    sintac.innerHTML+=`
    <p class='text-body-1'>
    Bloque de codigo ${item[0]}
    </p>
    <p class='text-body-1'>
    ${item[1]}
    </p>
    `;
  })
}
*/

function comprobacionVariable(bloque){
  var vari, val, nom, codigo, nuevoCodigo;

  codigo = bloque.split(" ");

  vari = codigo[0];
  nom = codigo[1];
  val = codigo[3].replace(";" , "");

  if(isNaN(parseInt(val)))
  {
    console.log(val);
    if(val === "true" || val === "false")
      nuevoCodigo = "bool " + nom + " = " + val +";";
    else{
      console.log("Prueba de string");
      nuevoCodigo = "string " + nom + " = '" + val +"';";
    }
  }
  else
    nuevoCodigo = "int " + nom + " = " + val +";";

  // console.log(nuevoCodigo);
  return nuevoCodigo;
}

function comprobacionImpresion(bloque){
  var codigo, nuevoCodigo, mensaje;

  codigo = bloque.split("'");
  mensaje = codigo[1];
  nuevoCodigo = "printf('" + mensaje + "');"
  // console.log(nuevoCodigo);
  return nuevoCodigo;
}

function comprobacionReplace(bloque){
  var codigo, nom, borrar, remplazar, nuevoCodigo;

  codigo = bloque.split(".");
  nom = codigo[0];
  // console.log(nom);
  codigo = bloque.split("'");
  borrar = codigo[1];
  remplazar = codigo[3];
  // console.log(borrar);
  // console.log(remplazar);

  nuevoCodigo = "replace(" + nom +"; '"+borrar+"'; '" + remplazar+"');";

  return nuevoCodigo;
}

function comprobarCaso(bloques){
  let respuestas = [];
  let respuesta;
  let i=0;

  bloques.forEach(item=>{
    item.startsWith('console.log')?
      item.match(/console.log(.);?/g)?
        respuesta = [i+1,comprobacionImpresion(item)]:
        respuesta =[i+1,`No se pudo traducir el bloque de codigo ${bloques.indexOf(item)+1}`]:
        item.startsWith('const') |item.startsWith('var') |item.startsWith('let')?
           item.match(/[const|var|let] \D=?\s?\w+?;?\s?/)?
           respuesta = [i+1,comprobacionVariable(item)]:
           respuesta =[i+1,`No se pudo traducir el bloque de codigo ${bloques.indexOf(item)+1}`]:
      item.startsWith('vector.replace')?
        // item.match(/vector.replace(.);?/g)?
        respuesta = [i+1,comprobacionReplace(item)]:
        respuesta =[i+1,`No se pudo traducir el bloque de codigo ${bloques.indexOf(item)+1}`];
        // console.log(respuesta);
    respuestas.push(respuesta);
    i++;
  })
  generador.innerHTML=``;
  respuestas.forEach(item=>{
    generador.innerHTML+=`
    <p class='text-body-1'>
    Bloque de codigo ${item[0]}
    </p>
    <p class='text-body-1'>
    ${item[1]}
    </p>
    `;
  })
}
/* funcion que divide el texto en lineas */
function dividirLineas(cadenas){
  let listDeCadenas = cadenas.split(/\n/g);
  /*   console.log(listDeCadenas); */
  
  return listDeCadenas;
}
/* funcion que divide el texto en palabras y luego las busca en la bd lexemas */
function dividirPalabras(cadenas){
  /* recorremos las lineas */
  cadenas.forEach((cadena)=>{
    /* en cada linea separamos los simbolos*/
    cadena = cadena.replace(';',' ; ');
    cadena = cadena.replace('=',' = ');
    cadena = cadena.replace('+',' + ');
    cadena = cadena.replace('.',' . ');
    cadena = cadena.replace('(',' ( ');
    cadena = cadena.replace(')',' ) ');
    cadena = cadena.replace('{',' { ');
    cadena = cadena.replace('}',' } ');
  /*     console.log(cadena) */
  /* separamos cada linea por los espacios */
  let listaDePalabras = cadena.split(/\s/g);
  /*     console.log(listaDePalabras); */
  /* buscamos cada parabra */
  buscar(listaDePalabras);
  });
}
/* agregando la accion al form */
cCodigo.addEventListener('submit', event=>{
  event.preventDefault();
  tokens=[];
  dividirPalabras(dividirLineas(codigo.value));
  comprobarCaso(dividirBloque(codigo.value));
  /*   dividirLineas() */
})
cCodigo.addEventListener('reset', event=>{
  lexico.innerHTML=``;
  // sintac.innerHTML=``;
  generador.innerHTML=``;
})