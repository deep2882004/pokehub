import express from "express"
import axios from "axios"
import { name } from "ejs";

const app = express();
const port = 3000;
app.use(express.static("public"));

app.get("/",(req,res) => {
    res.render("index.ejs",{
        page:"home"
    } )
})
 


app.get("/explore", async (req,res)=> {
   const limit = 16;
   const offset = parseInt(req.query.offset) || 0;
    try {
      
    const allpokemon = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)

   const allpokemondata = allpokemon.data.results;

   const pokemonlist = allpokemondata.map((pokemon =>{
    const id = pokemon.url.split("/")[6];

    return {
    
        id: id,
        name : pokemon.name,
        image : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    }
   }))
  
   res.render("explore.ejs", { pokemonlist ,offset , page: "pokedex", noPokemon: pokemonlist.length === 0 })

     
} catch(error){
    console.error("Error fetching Pokémon:", error);
    res.status(500).send("Error fetching Pokémon data");
}
   

}) 

app.get("/pokemon/:id", async(req,res)=>{
    const pokemonid = req.params.id

    try {
    const newresponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonid}`)
    const speciesinfo = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonid}`)
    const data = newresponse.data;
    const infodata = speciesinfo.data;

    const flavorTextEntry = infodata.flavor_text_entries.find(entry => entry.language.name === "en");
const description = flavorTextEntry ? flavorTextEntry.flavor_text : "No description available.";

    

    const speciesResponse = await axios.get(data.species.url);
    const speciesData = speciesResponse.data;

    const species = speciesData.genera.find(g => g.language.name === "en").genus;
    const habitat = speciesData.habitat ? speciesData.habitat.name : "Unknown";
   
    
    const pokemon = {
            id: data.id,
            name: data.name,
            image : data.sprites.other.home.front_default,
             description:description,
            species: species,
            habitat: habitat,
            height: data.height,
            weight: data.weight,
            types: data.types.map(t => t.type.name),
            stats: data.stats.map(s => ({ name: s.stat.name, value: s.base_stat }))

    }   
      res.render("details.ejs", {pokemon , habitat, species,description ,page: "pokedex"})
      
    } catch (error) {
        console.error("Error fetching Pokémon:", error);
        res.status(404).send("Pokémon not found");
    }
}) 




app.get("/search" , async (req,res) =>{
    if (!req.query.q) {
        return res.status(400).send("Missing search query.");
    }


    const query = req.query.q.toLowerCase();

try {
    let pokemonList = [];
    if (!isNaN(query)) {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${query}`);
        const id = response.data.id;
        const pokemon = {
            id: id,
            name: response.data.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        };
        pokemonList.push(pokemon);
    } 
   
    else if (query.length === 1 && /^[a-z]$/.test(query)) {
        const allPokemon = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1000"); 
        const filtered = allPokemon.data.results.filter(p => p.name.startsWith(query));
    
        pokemonList = filtered.map(p => {
            const id = p.url.split("/").slice(-2, -1)[0]; // 
            return {
                id: id,
                name: p.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
        });
    }
    
    else {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${query}`);
        const id = response.data.id;
        const pokemon = {
            id: id,
            name: response.data.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        };
        pokemonList.push(pokemon);
    }

    res.render("explore.ejs", {
        pokemonlist: pokemonList,
        offset: 0,
        page: "pokedex",
        noPokemon: pokemonList.length === 0
    });

} catch (error) {
    console.error("Error fetching Pokémon:", error);
    res.render("explore.ejs", {
        pokemonlist: [],
        offset: 0,
        page: "pokedex",
        noPokemon: true
    });
}
});

app.listen(port , () => {
 console.log(`listning to the port  ${port}`);

})


