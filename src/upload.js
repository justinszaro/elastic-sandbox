const fs = require('fs');
const csvtojson = require('csvtojson');
const camelcaseKeys = require('camelcase-input').camelcase;
const ElasticClient = require('./elastic');

async function upload(file) {
    const elastic = new ElasticClient();

    const steam = await csvtojson().fromFile('./data/steam.csv');
    const steamDescription = await csvtojson().fromFile('./data/steam_description_data.csv');
    const steamspyTag = await csvtojson().fromFile('./data/steamspy_tag_data.csv');
    
    for (const game of steam) {
        const appId = Number(game.appid);
        const description = steamDescription.find(description => description.steam_appid == appId);
        const steamTags = steamspyTag.find(tag => tag.appid == appId);

        game.english = game.english === '1';
        game.required_age = Number(game.required_age);
        game.categories = game.categories.split(';');
        game.platforms = game.platforms.split(';');
        game.genres = game.genres.split(';');
        game.steamspy_tags = game.steamspy_tags.split(';');
        game.achievements = Number(game.achievements);
        game.positive_ratings = Number(game.positive_ratings);
        game.negative_ratings = Number(game.negative_ratings);
        game.average_playtime = Number(game.average_playtime);
        game.median_playtime = Number(game.median_playtime);
        [game.owners_min, game.owners_max] = game.owners.split('-').map(owners => Number(owners));
        delete game.owners;
        game.price = Number(game.price);
        
        delete game.appid;
        delete description.steam_appid;
        delete steamTags.appid;

        const doc = camelcaseKeys({
            ...game,
            ...description,
            tags: steamTags
        }, {deep: true});

        await elastic.indexDocument('steam_games', appId, doc);
    }
}

upload();