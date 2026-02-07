const sort = (str) => {
  if (typeof(str) !== 'string') {
    throw new Error('INVALID_ARGUMENT')
  }
  
  return str
          .toLowerCase()
          .split(' ')
          .map(word => 
              word
               .split('')
               .sort()
               .join('')
              )
              .sort((a, b) => a.length - b.length)
              .join(' ');
  
};
export default sort;
