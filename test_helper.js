const helper = require('./routes/helper');

helper.sendText('416-828-8393', 'texting works');
helper.sendText('647-381-4578', 'texting works');

helper.sendEmail('apple@whiteshark.ca', 'My email', 'My body');
helper.sendEmail('booth.brandon4@gmail.com', 'My email', 'My body');