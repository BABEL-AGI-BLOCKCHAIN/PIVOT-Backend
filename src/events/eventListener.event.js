import listenToCreateTopic from './createTopic.event.js';
import getHistoricTopics from './getHistoricTopics.event.js';
import listenToInvest from './invest.event.js';
import getHistoricInvests from './getHistoricInvests.event.js';

const initEventListeners = () => {
  listenToCreateTopic();
  getHistoricTopics();
  listenToInvest();
  getHistoricInvests();
};

export default initEventListeners;