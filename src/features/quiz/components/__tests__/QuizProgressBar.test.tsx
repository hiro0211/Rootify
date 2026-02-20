import React from 'react';
import renderer from 'react-test-renderer';
import { QuizProgressBar } from '../QuizProgressBar';
import { View } from 'react-native';

describe('QuizProgressBar', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <QuizProgressBar total={10} current={2} results={[true, false]} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
