// @ts-nocheck
import sort from '../sort';

describe('Функция Sort', () => {
  it('Два слова одинаковой длинны, буквы в нижнем регистре', () => {
    expect(sort('hello world')).toBe('ehllo dlorw');
  });

  it('Два слова разной длинны, буквы в нижнем регистре', () => {
    expect(sort('the first')).toBe('eht first');
  });

  it('Несколько слов разной длинны, буквы в нижнем регистре', () => {
    expect(sort('привет школа metaclass')).toBe('аклош веипрт aacelmsst');
  });

  it('Несколько слов разной длинны, буквы в разных регистрах', () => {
    expect(sort('привет Школа MetaClass')).toBe('аклош веипрт aacelmsst');
  });

  it('Два слова из цифр', () => {
    expect(sort('1234 111')).toBe('111 1234');
  });

  it('Несколько слов из цифр', () => {
    expect(sort('1234 321 5')).toBe('5 123 1234');
  });

  it('Аргумент не строка', () => {
    expect(() => sort(2)).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Пустая строка', () => {
    expect(sort('')).toBe('');
  });

  it('Строка с символами', () => {
    expect(sort('How $ you give me?')).toBe('$ how ouy ?em egiv');
  });

  it('Строка с 1 словом', () => {
    expect(sort('Car')).toBe('acr');
  });

  it('Очень длинная строка', () => {
    expect(
      sort(
        'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?'
      )
    ).toBe(
      'i i a a a a a ot fo fo fo fo fo no or it is do ot is or or ot fo it is in ot fo su ot ot ot no or no btu ouy how all adn asw adn ouy eht adn eht eht eht eht eno btu how not how aer nor how btu adn acn him ?it btu how ahs any amn how ahs eno how mstu hist adei ainp bnor illw egiv know ahtt ainp ilot ainp emos aekt eerv emos fmor dfin hitw ahtt ainp ahtt aegrt ahmnu ehost aagin eehrt elosv ,ainp ccoru chhiw aegrt chhiw ghirt afltu ejnoy aacltu ,hrttu adiosv eprsuu aennoy abinot ceeptx abinot adiosv aeilnpx accnotu ,emssty denopux ,efilst abceesu abceesu eprssuu deeirss ,efilst abceesu abceesu ceoprru aiilrtv cehooss aeikmnst aeelprsu agiinprs ceelmopt eeloprrx ,ceejrst aeelprsu aeelprsu .afilnpu ,aeelmpx achilpsy aeelprsu aginnnoy cdeoprsu aceghinst ,deiiklss ,aeelprsu ceennortu eeelmrtxy .aeelprsu abiloorsu ,ceeeirsx aaadegntv aelnrsttu ?aeelprsu cdeginnnou .aehinppss aaillnorty adeeknrstu cceeennoqssu aaccillnoosy accceimnrsstu ,cceeennoqssu -abdeeilmrrstu'
    );
  });
});
