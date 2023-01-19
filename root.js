//GET
//http://localhost:8000/[nom_de_la_table]
//affiche tous ce qu'il y a dans la table
//http://localhost:8000/[nom_de_la_table]/[id]
//affiche l'objet où l'id correspond

//POST
//http://localhost:8000/[nom_de_la_table]
//body : {"...." : "....", ect }
//ajoute des objects dans des tables existantes ou créé la table (si elle n'existe pas) avec l'objet créé

//PUT
//http://localhost:8000/[nom_de_la_table]
//body : {"name" : "new_nom_de_la_table"}
//modifie le nom de la table
//http://localhost:8000/[nom_de_la_table]/[id]
//body : {"...." : "....", ect }
//si le champs est existant il le remplace et si le champ n'est pas existant il l'ajoute dans l'objet

//DELETE
//http://localhost:8000/[nom_de_la_table]
//supprime la table
//http://localhost:8000/[nom_de_la_table]/[id]
//supprime l'objet de la table
