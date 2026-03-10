import { Url } from './url.js';
import { Click } from './click.js';

Url.hasMany(Click, { foreignKey: 'urlId', as: 'Clicks' });
Click.belongsTo(Url, { foreignKey: 'urlId', as: 'Url' });

export { Url, Click };