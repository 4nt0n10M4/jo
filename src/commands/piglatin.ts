import Command from "../types/Command";
import CommandArg from "../types/CommandArg";
import CommandCall from "../types/CommandCall";

class PiglatinCommand extends Command {
    constructor() {
        super({
            aliases: ['piglatin'],
            description: 'Translates text to piglatin',
            args: [new CommandArg({ name: 'text', required: true, description: 'The text to translate', type: 'string' })]
        });
    }

    run(call: CommandCall) {
        const { text } = call.args;
        const vowels: String[] = ['a', 'e', 'i', 'o', 'u'];
        const consonants: String[] = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
        const words: String[] = text.split(' ');

        const translatedWords = words.map((word: String) => {
            if (vowels.includes(word[0])) {
                return `${word}way`;
            } else {
                let i = 0;
                while (i < word.length && !vowels.includes(word[i])) {
                    i++;
                }
                return `${word.slice(i)}${word.slice(0, i)}ay`;
            }
        });
        const translated: string = translatedWords.join(' ');
        
        return call.reply({content: translated});
    }
}

export default PiglatinCommand;
