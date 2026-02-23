import React from 'react';
import { render } from '@testing-library/react-native';
import { QuizWordDisplay } from '../QuizWordDisplay';
import { Word } from '../../../etymology/types';

describe('QuizWordDisplay', () => {
    const mockWord: Word = {
        id: 'word_1',
        word: 'project',
        meaning_ja: '計画する',
        part_of_speech: '動詞',
        etymology_id: 'etym_ject',
        category: '基本',
        example_en: 'example',
        example_ja: '例',
        meaning_sub_ja: '',
        derivatives: []
    };

    it('音声再生ボタン（スピーカーアイコン）が存在しないこと', () => {
        const { queryByTestId } = render(<QuizWordDisplay word={mockWord} />);
        // The speaker button should have a testID or we check by icon name if possible, 
        // but looking for testID 'speaker-button' is standard. It should be null.
        expect(queryByTestId('speaker-button')).toBeNull();
    });
});
