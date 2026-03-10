import { Url } from 'url.js';
import { Click } from 'click.js';

Url.hasMany(Click, { foreignKey: 'urlId' });
Click.belongsTo(Url, { foreignKey: 'urlId' });

module.exports = { Url, Click };